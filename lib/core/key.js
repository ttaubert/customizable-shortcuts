/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {Windows} = require("util/windows");
const {Shortcut} = require("core/shortcut");
const {Modifiers} = require("core/modifiers");

function Key(data) {
  let element = Windows.getElementById(data.id);

  this.id = data.id;
  this.element = element;
  this.key = element.getAttribute("key").toUpperCase().charCodeAt(0);
  this.keycode = element.getAttribute("keycode");

  if (element.hasAttribute("modifiers"))
    this.modifiers = new Modifiers({modifiers: element.getAttribute("modifiers").split(/[,\s]/)});

  this.shortcut = new Shortcut({key: this.key, keycode: this.keycode, modifiers: this.modifiers});
}

Key.prototype = {
  executeCommand: function Key_executeCommand() {
    if (this.element.hasAttribute("command")) {
      let command = this.element.getAttribute("command");
      command = Windows.getElementById(command);
      command && command.doCommand();
      return;
    }

    if (this.element.hasAttribute("oncommand")) {
      let sourceEvent = Windows.createEvent("Events");
      sourceEvent.initEvent("command", false, false);
      let event = Windows.createEvent("XULCommandEvents");
      event.initCommandEvent("command", true, false, null, null, false, false, false, false, sourceEvent);
      this.element.dispatchEvent(event);
    }
  },

  getLabel: function Key_getLabel() {
    return this.element.getAttribute("label");
  },

  toString: function Key_toString() {
    return this.id;
  }
};

let Keys = {
  _keys: null,

  _loadKeys: function () {
    this._keys = {};

    let children = Windows.querySelectorAll("key");
    for (let c = 0; c < children.length; c++) {
      let key = children[c];
      if (key.hasAttribute("id")) {
        let id = key.getAttribute("id");
        this._keys[id] = new Key({id: id});
      }
    }

    return this._keys;
  },

  get keys() {
    return this._keys || this._loadKeys();
  }
}

exports.Key = Key;
exports.Keys = Keys;
