/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const MODIFIER_KEYS = {16: "shift", 17: "control", 18: "alt", 224: "meta"};
const MODIFIER_NAMES = {control: "Ctrl", meta: "Meta", shift: "Shift", alt: "Alt"};

let gKeys = new Map();
let gDOMKeys = {};
let gAccelKeyName = "control";
let gTerm = "";

addEventListener("load", function () {
  // Work around bug 995889.
  for (let style of document.querySelectorAll("style")) {
    style.remove();
  }

  // Let the parent know we're ready.
  self.port.emit("ready");

  // Update the tree when the filter text changes.
  let textbox = document.getElementById("filter");
  textbox.addEventListener("command", () => {
    // Normalize search term and update list of keys.
    treeview.filter(textbox.value.replace(/^\s+||s+$/, "").toLowerCase());
  });
});

self.port.on("init", function ({keys, DOMKeys, accelKey}) {
  keys.forEach(key => {
    let modifiers = new Set(key.modifiers || []);
    key.combination = getCombination(modifiers, key.key, key.keycode);
    gKeys.set(key.id, key);
  });

  gDOMKeys = DOMKeys;
  gAccelKeyName = MODIFIER_KEYS[accelKey] || "control";

  // Render the tree.
  treeview.update();
});

function isModifier(key) {
  return key in MODIFIER_KEYS;
}

function isCompleteShortcut(event) {
  for (let name of Object.keys(gDOMKeys)) {
    let key = gDOMKeys[name];

    if (!isModifier(key) && event.keyCode == key) {
      return true;
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
  for (let name of Object.keys(gDOMKeys)) {
    let key = gDOMKeys[name];

    if (!isModifier(key) && event.keyCode == key) {
      return name.replace(/^DOM_/, "");
    }
  }

  return null;
}

function getCombination(modifiers, key, keycode) {
  let parts = [];

  if (modifiers.size) {
    if (modifiers.has("accel")) {
      modifiers.add(gAccelKeyName);
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
