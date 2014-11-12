/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const MODIFIER_KEYS = {16: "shift", 17: "control", 18: "alt", 91: "meta", 92: "meta", 224: "meta"};
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

  if (event.keyCode in MODIFIER_KEYS) {
    modifiers.push(MODIFIER_KEYS[event.keyCode]);
  }

  return modifiers;
}

function getModifiersText(modifiers) {
  let parts = [];

  for (let name in MODIFIER_NAMES) {
    if (modifiers.indexOf(name) > -1) {
      parts.push(MODIFIER_NAMES[name] + "+");
    }
  }

  return parts.join("");
}
