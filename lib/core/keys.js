/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {Windows} = require("util/windows");
const {Shortcut} = require("core/shortcut");
const {Modifiers} = require("core/modifiers");

let Key = exports.Key = function (data) {
  let element = Windows.getElementById(data.id);

  this.id = data.id;
  this.element = element;
  this.key = element.getAttribute("key").toUpperCase().charCodeAt(0);
  this.keycode = element.getAttribute("keycode");

  if (element.hasAttribute("modifiers")) {
    let modifiers = element.getAttribute("modifiers").split(/[,\s]/);
    this.modifiers = new Modifiers({modifiers: modifiers});
  }

  this.shortcut = new Shortcut({key: this.key, keycode: this.keycode, modifiers: this.modifiers});
}

Key.prototype = {
  executeCommand: function () {
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

  getLabel: function () {
    return this.element.getAttribute("label");
  },

  toString: function () {
    return this.id;
  }
};

let all = exports.all = (function () {
  let cache;

  return function () {
    if (!cache) {
      cache = new Map();

      for (let child of Windows.querySelectorAll("key")) {
        if (child.hasAttribute("id")) {
          let id = child.getAttribute("id");
          cache.set(id, new Key({id: id}));
        }
      }
    }

    return cache;
  };
})();

exports.find = function (id) {
  return all().get(id);
};

exports.filter = function (fun) {
  let filtered = new Map();

  for (let key of all().values()) {
    if (fun(key)) {
      filtered.set(key.id, key);
    }
  }

  return filtered;
};

exports.group = function (keys, groups, defaultGroup) {
  let remaining = new Map(keys);
  let retval = new Map();

  for (let name in groups) {
    let group = [];

    for (let id of groups[name]) {
      if (remaining.has(id)) {
        group.push(keys.get(id));
        remaining.delete(id);
      }
    }

    if (group.length) {
      retval.set(name, group);
    }
  }

  if (remaining.size) {
    retval.set(defaultGroup, [...remaining.values()]);
  }

  return retval;
};
