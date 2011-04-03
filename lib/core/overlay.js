/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is
 * Tim Taubert <tim@timtaubert.de>
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

let {storage} = require("simple-storage");
let {Shortcut} = require("core/shortcut");
let {serialize, unserialize} = require("util/serialization");

let Overlay = function (data, options) {
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
    Overlays._storeOverlays();
}

Overlay.prototype.remove = function () {
  let overlays = Overlays.overlays;
  delete overlays.keys[this.key.toString()];
  delete overlays.custom[this.shortcut.toString()];
  delete overlays.overridden[this.key.shortcut.toString()];
}

let Overlays = {
  _overlays: null,

  _loadOverlays: function () {
    this._overlays = {keys: {}, custom: {}, overridden: {}};
    (storage.overlays || []).forEach(unserialize);
    return this._overlays;
  },

  _storeOverlays: function () {
    storage.overlays = [];
    for (let [key, overlay] in Iterator(this.overlays.keys))
      storage.overlays.push(serialize(overlay));
  },

  get overlays() {
    return this._overlays || this._loadOverlays();
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
