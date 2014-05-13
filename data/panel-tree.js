/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let tree = (function () {

  let allKeys = new Map();
  let node = unsafeWindow.document.getElementById("tree");
  node.addEventListener("select", buttons.update);

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

  function findConflict(modifiers, code) {
    for (let [id, key] of allKeys) {
      let overlay = overlays.get(id) || key;

      if (!overlay || overlay.disabled) {
        continue;
      }

      if (sameModifiers(overlay.modifiers, modifiers) && overlay.code == code) {
        return key;
      }
    }

    return null;
  }

  addEventListener("keydown", function (event) {
    // Ignore events when not in edit mode.
    if (!node.editingColumn) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    let modifiers = modifiersFromEvent(event);
    node.inputField.value = getModifiersText(modifiers);

    // Bail out if the shortcut isn't complete yet.
    if (isModifier(event.keyCode)) {
      return;
    }

    let conflict = findConflict(modifiers, event.keyCode);

    // Disable any conflicting shortcuts and show a warning.
    if (conflict) {
      notifications.add(conflict);
      overlays.disable(conflict.id);
    }

    let text = event.key[0].toUpperCase() + event.key.slice(1).toLowerCase();
    node.inputField.value += text;
    overlays.set(tree.selected, modifiers, event.keyCode, text);

    node.stopEditing(true);
    buttons.update();
    node.focus();
  }, true);

  self.port.on("keys", function (keys) {
    allKeys = new Map();

    for (let id of Object.keys(keys)) {
      let key = keys[id];
      key.id = id;
      key.combination = getModifiersText(key.modifiers || []) + key.text;
      allKeys.set(key.id, key);
    }

    // Render the tree.
    node.view = treeview.create(allKeys);
  });

  return {
    get selected() {
      let row = node.currentIndex;
      let column = node.columns.getLastColumn();
      return node.view.getCellValue(row, column);
    },

    filter: function (term) {
      let filtered = new Map();

      for (let [id, key] of allKeys) {
        let label = key.label.toLowerCase();
        let combination = key.combination.toLowerCase();

        if (!term || label.contains(term) || combination.contains(term)) {
          filtered.set(id, key);
        }
      }

      node.view = treeview.create(filtered);
    },

    editSelectedRow: function () {
      let row = node.currentIndex;
      let column = node.columns.getLastColumn();
      node.startEditing(row, column);
    },

    invalidateSelectedRow: function () {
      let row = node.currentIndex;
      node.treeBoxObject.invalidateRow(row);
    }
  };
})();
