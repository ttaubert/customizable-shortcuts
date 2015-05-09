/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const self = require("sdk/self");
const panels = require("sdk/panel");
const utils = require("sdk/window/utils");
const winUtils = require("sdk/deprecated/window-utils");
const {storage} = require("sdk/simple-storage");
const {ActionButton} = require("sdk/ui/button/action");

// Import shared modifiers code.
const gModifiers = eval(self.data.load("shared-modifiers.js") + "gModifiers");

const hotkeys = require("hotkeys");
const command = require("command");

let panel = panels.Panel({
  width: 500,
  height: 500,
  contentURL: "chrome://customizable-shortcuts/content/panel.xul",
  contentScriptWhen: "ready",

  contentScriptFile: [
    "panel-bug995889.js",
    "panel-buttons.js",
    "panel-treeview.js",
    "panel-hotkeys.js",
    "panel-tree.js",
    "panel-keygroups.js",
    "panel-overlays.js",
    "panel-conflicts.js",
    "shared-modifiers.js",
    "panel.js"
  ].map(file => self.data.url(file)),

  onShow() {
    panel.port.emit("focus");
  }
});

let {getActiveView} = require("sdk/view/core");
let view = getActiveView(panel);
view.setAttribute("ignorekeys", "true");

panel.port.on("ready", function () {
  panel.port.emit("overlays", gOverlays = storage.overlays || {});
  panel.port.emit("hotkeys", gHotKeys = hotkeys.get());
});

panel.port.on("hide", () => panel.hide());

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
  onTrack(window) {
    if (utils.isBrowser(window)) {
      window.addEventListener("keydown", handlePossibleShortcut);
    }
  },

  onUntrack(window) {
    if (utils.isBrowser(window)) {
      window.removeEventListener("keydown", handlePossibleShortcut);
    }
  }
});

let gHotKeys = {};
let gOverlays = {};

panel.port.on("overlays", function (overlays) {
  storage.overlays = gOverlays = overlays;
});

function findOverlay(event) {
  let evmodifiers = gModifiers.fromEvent(event);

  return Object.keys(gOverlays).find(id => {
    let {disabled, key, modifiers} = gOverlays[id];
    return !disabled && event.key == key && evmodifiers == modifiers;
  });
}

function findOverridden(event) {
  let modifiers = gModifiers.fromEvent(event);

  return Object.keys(gOverlays).map(id => gHotKeys[id]).some(hotkey => {
    return event.key == hotkey.key && modifiers == hotkey.modifiers;
  });
}

function handlePossibleShortcut(event) {
  // Ignore synthetic events.
  if (!event.isTrusted) {
    return;
  }

  let overlay = findOverlay(event);

  if (overlay) {
    command.execute(overlay);
  } else {
    overlay = findOverridden(event);
  }

  if (overlay) {
    event.preventDefault();
    event.stopPropagation();
  }
}
