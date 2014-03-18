/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {storage} = require("sdk/simple-storage");
const {Shortcut} = require("core/shortcut");
const {serialize, unserialize} = require("util/serialization");

function Overlay(data, options) {
  this.key = data.key;
  this.shortcut = data.shortcut;

  Overlays.removeByKey(this.key);

  if (!this.key.shortcut.equals(this.shortcut)) {
    let overlays = Overlays.overlays;
    overlays.keys[this.key.toString()] = this;
    overlays.custom[this.shortcut.toString()] = this;
    overlays.overridden[this.key.shortcut.toString()] = this;
  }

  if (!options || !options.dontStore)
    Overlays.store();
}

Overlay.prototype.remove = function () {
  let overlays = Overlays.overlays;
  delete overlays.keys[this.key.toString()];
  delete overlays.custom[this.shortcut.toString()];
  delete overlays.overridden[this.key.shortcut.toString()];
  Overlays.store();
}

let Overlays = {
  _overlays: null,

  _load: function () {
    this._overlays = {keys: {}, custom: {}, overridden: {}};
    (storage.overlays || []).forEach(unserialize);
    return this._overlays;
  },

  store: function () {
    storage.overlays = [];
    for (let key in this.overlays.keys)
      storage.overlays.push(serialize(this.overlays.keys[key]));
  },

  get overlays() {
    return this._overlays || this._load();
  },

  findByKey: function (key) {
    let idx = key.toString();
    if (idx in this.overlays.keys)
      return this.overlays.keys[idx];
  },

  findByCustomShortcut: function (shortcut) {
    let idx = shortcut.toString();
    if (idx in this.overlays.custom)
      return this.overlays.custom[idx];
  },

  findByOverriddenShortcut: function (shortcut) {
    let idx = shortcut.toString();
    if (idx in this.overlays.overridden)
      return this.overlays.overridden[idx];
  },

  removeByKey: function (key) {
    let overlay = this.findByKey(key);
    overlay && overlay.remove();
  }
}

exports.Overlay = Overlay;
exports.Overlays = Overlays;
