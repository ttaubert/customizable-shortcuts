/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const MODIFIER_KEYS = {16: "shift", 17: "control", 18: "alt", 224: "meta"};
const MODIFIER_NAMES = {control: "Ctrl", meta: "Meta", shift: "Shift", alt: "Alt"};

let gKeys = {};
let gDOMKeys = {};
let gAccelKeyName = "control";

// Remove HTML styles injected by the add-on SDK.
addEventListener("load", function () {
  for (let style of document.querySelectorAll("style")) {
    style.remove();
  }

  // TODO sent by parent on show?
  self.port.emit("init");

  // Update the tree when the filter text changes.
  let textbox = document.getElementById("filter");
  textbox.addEventListener("command", () => {
    // Normalize search term and update list of keys.
    updateTreeView(textbox.value.replace(/^\s+||s+$/, "").toLowerCase());
  });
});

self.port.on("init", function ({keys, DOMKeys, accelKey}) {
  gKeys = keys;
  gDOMKeys = DOMKeys;
  gAccelKeyName = MODIFIER_KEYS[accelKey] || "control";

  updateTreeView();
});

function updateTreeView(term) {
  let data = {};

  // Filter by the given term.
  for (let name of Object.keys(gKeys)) {
    data[name] = gKeys[name];

    if (term) {
      data[name] = data[name].filter(key => {
        return true;
        //return key.label.toLowerCase().contains(term) ||
               //key.combination.toLowerCase().contains(term);
      });
    }

    if (data[name].length == 0) {
      delete data[name];
    }
  }

  unsafeWindow.document.getElementById("shortcutsTree").view = new TreeView(data);
}

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

addEventListener("keydown", function (event) {
  let tree = unsafeWindow.document.getElementById("shortcutsTree");

  // Ignore events when not in edit mode.
  if (!tree.editingColumn) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  let keycode = keyCodeFromEvent(event);
  let modifiers = modifiersFromEvent(event);
  tree.inputField.value = getCombination(modifiers, null, keycode);

  //let {editingRow, editingColumn} = tree;
  //let id = tree.view.getCellValue(editingRow, editingColumn);

  if (isCompleteShortcut(event)) {
    //new Overlay({key: keys.find(id), shortcut: shortcut});

    tree.stopEditing(true);
    //this._onSelect(event);
  }
}, true);
