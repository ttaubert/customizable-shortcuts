/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const self = require("sdk/self");
const prefs = require("sdk/preferences/service");
const panels = require("sdk/panel");
const utils = require("sdk/window/utils");
const winUtils = require("sdk/deprecated/window-utils");
const bug645371 = require("patch/bug-645371");
const {storage} = require("sdk/simple-storage");
const {Overlays} = require("core/overlay");
const {Shortcut} = require("core/shortcut");
const {ActionButton} = require("sdk/ui/button/action");

const keys = require("keys");

function collectDOMKeys() {
  const {Ci} = require("chrome");

  let domKeys = {};
  for (let name of Object.keys(Ci.nsIDOMKeyEvent)) {
    domKeys[name] = Ci.nsIDOMKeyEvent[name];
  }

  return domKeys;
}

let panel = panels.Panel({
  width: 500,
  height: 500,
  contentURL: "chrome://customizable-shortcuts/content/panel.xul",

  contentScriptWhen: "ready",
  contentScriptOptions: {
    DOMKeys: collectDOMKeys(),
    accelKey: prefs.get("ui.key.accelKey")
  },

  contentScriptFile: [
    self.data.url("panel-bug995889.js"),
    self.data.url("panel-buttons.js"),
    self.data.url("panel-treeview.js"),
    self.data.url("panel-tree.js"),
    self.data.url("panel-keygroups.js"),
    self.data.url("panel-overlays.js"),
    self.data.url("panel.js")
  ]
});

panel.port.on("ready", function () {
  panel.port.emit("keys", keys.get());
});

/*panel.port.on("new-overlay", function ({id, modifiers, keycode}) {
  storage[id] = {modifiers: modifiers, keycode: keycode};
});*/

let button = ActionButton({
  id: "shortcuts-button",
  label: "Customize Shortcuts",

  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png"
  },

  onClick: function () {
    panel.show({position: button});
  }
});

new winUtils.WindowTracker({
  onTrack: function (window) {
    if (utils.isBrowser(window)) {
      bug645371.applyPatch(window);
      window.addEventListener("keydown", handlePossibleShortcut);
    }
  },

  onUntrack: function (window) {
    if (utils.isBrowser(window)) {
      window.removeEventListener("keydown", handlePossibleShortcut);
    }
  }
});

function handlePossibleShortcut(event) {

  // TODO try to find/execute an overlay for {modifiers + keycode}
  // TODO need map of mods/keycode mapping to key ids

  // TODO shortcut might have been disabled

  // TODO shortcut might have been overriden by another action
  // TODO need map of mods/keycode of all keys to their ids

  let shortcut = Shortcut.fromEvent(event);

  // check if this is a custom shortcut
  let overlay = Overlays.findByCustomShortcut(shortcut);

  if (overlay) {
    overlay.key.executeCommand();
  } else { // check if this is a shortcut that is overriden by a custom one
    overlay = Overlays.findByOverriddenShortcut(shortcut);
  }

  if (overlay) {
    event.preventDefault();
    event.stopPropagation();
  }
}
