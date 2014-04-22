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

const keys = require("keys");
const command = require("command");

let panel = panels.Panel({
  width: 500,
  height: 500,
  contentURL: "chrome://customizable-shortcuts/content/panel.xul",
  contentScriptWhen: "ready",

  contentScriptFile: [
    self.data.url("panel-bug995889.js"),
    self.data.url("panel-buttons.js"),
    self.data.url("panel-treeview.js"),
    self.data.url("panel-tree.js"),
    self.data.url("panel-keygroups.js"),
    self.data.url("panel-overlays.js"),
    self.data.url("panel.js")
  ],

  onShow: function () {
    panel.port.emit("focus");
  }
});

let {getActiveView} = require("sdk/view/core");
let view = getActiveView(panel);
view.setAttribute("ignorekeys", "true");

panel.port.on("ready", function () {
  panel.port.emit("overlays", gOverlays = storage.overlays || {});
  panel.port.emit("keys", gKeys = keys.get());
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
  onTrack: function (window) {
    if (utils.isBrowser(window)) {
      window.addEventListener("keydown", handlePossibleShortcut);
    }
  },

  onUntrack: function (window) {
    if (utils.isBrowser(window)) {
      window.removeEventListener("keydown", handlePossibleShortcut);
    }
  }
});

let gKeys = {};
let gOverlays = {};

panel.port.on("overlays", function (overlays) {
  storage.overlays = gOverlays = overlays;
});

const MODIFIER_KEYS = {16: "shift", 17: "control", 18: "alt", 224: "meta"};

function modifiersFromEvent(event) {
  let modifiers = [];

  if (event.ctrlKey) {
    modifiers.push("control");
  }

  if (event.shiftKey) {
    modifiers.push("shift");
  }

  if (event.metaKey) {
    modifiers.push("meta");
  }

  if (event.altKey) {
    modifiers.push("alt");
  }

  return modifiers;
}

function isModifier(key) {
  return key in MODIFIER_KEYS;
}

function sameModifiers(m1, m2) {
  if (m1.length != m2.length) {
    return false;
  }

  m2 = new Set(m2);

  for (let modifier of m1) {
    if (!m2.has(modifier)) {
      return false;
    }
  }

  return true;
}

function findOverlay(event) {
  let modifiers = modifiersFromEvent(event);

  for (let id of Object.keys(gOverlays)) {
    let overlay = gOverlays[id];
    if (event.keyCode == overlay.code && sameModifiers(modifiers, overlay.modifiers)) {
      return id;
    }
  }

  return null;
}

function findOverridden(event) {
  let modifiers = modifiersFromEvent(event);

  for (let id of Object.keys(gOverlays)) {
    if (event.keyCode == gKeys[id].code && sameModifiers(modifiers, gKeys[id].modifiers)) {
      return true;
    }
  }

  return false;
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
