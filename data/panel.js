/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const MODIFIER_KEYS = {16: "shift", 17: "control", 18: "alt", 224: "meta"};
const MODIFIER_NAMES = {control: "Ctrl", meta: "Meta", shift: "Shift", alt: "Alt"};

// Notify the parent that we're ready.
self.port.emit("ready");

// Update the tree when the filter text changes.
let textbox = document.getElementById("filter");
textbox.addEventListener("command", function (event) {
  // Normalize search term and update list of keys.
  tree.filter(textbox.value.replace(/^\s+||s+$/, "").toLowerCase());
});

textbox.addEventListener("keydown", function (event) {
  if (event.keyCode == KeyEvent.DOM_VK_ESCAPE && textbox.value != "") {
    event.stopPropagation();
  }
}, true);

addEventListener("keydown", function (event) {
  if (event.keyCode == KeyEvent.DOM_VK_ESCAPE) {
    self.port.emit("hide");
  }
});

self.port.on("focus", function () {
  window.focus();
});

function isModifier(key) {
  return key in MODIFIER_KEYS;
}

function isCompleteShortcut(event) {
  for (let name of Object.keys(KeyEvent)) {
    if (name.startsWith("DOM_VK_")) {
      let key = KeyEvent[name];

      if (!isModifier(key) && event.keyCode == key) {
        return true;
      }
    }
  }

  return false;
}

function modifiersFromEvent(event) {
  let modifiers = new Set();

  if (event.ctrlKey) {
    modifiers.add("control");
  }

  if (event.shiftKey) {
    modifiers.add("shift");
  }

  if (event.metaKey) {
    modifiers.add("meta");
  }

  if (event.altKey) {
    modifiers.add("alt");
  }

  if (event.keyCode in MODIFIER_KEYS) {
    modifiers.add(MODIFIER_KEYS[event.keyCode]);
  }

  return modifiers;
}

function keyCodeFromEvent(event) {
  for (let name of Object.keys(KeyEvent)) {
    if (name.startsWith("DOM_VK_")) {
      let key = KeyEvent[name];

      if (!isModifier(key) && event.keyCode == key) {
        return name.replace(/^DOM_/, "");
      }
    }
  }

  return null;
}

function getCombination(modifiers, key, keycode) {
  let parts = [];

  if (modifiers.size) {
    if (modifiers.has("accel")) {
      modifiers.add(MODIFIER_KEYS[self.options.accelKey] || "control");
    }

    for (let name in MODIFIER_NAMES) {
      if (modifiers.has(name)) {
        parts.push(MODIFIER_NAMES[name] + "+");
      }
    }
  }

  if (key) {
    parts.push(String.fromCharCode(key));
  }

  if (keycode) {
    let keyName = keycode.replace(/^VK_/, "");
    keyName = keyName[0] + keyName.substr(1).toLowerCase();
    keyName = keyName.replace(/_[a-z]/i, str => str[1].toUpperCase());
    parts.push(keyName);
  }

  return parts.join("");
}
