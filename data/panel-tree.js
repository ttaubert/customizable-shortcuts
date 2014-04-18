/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let tree = (function () {

  let allKeys = new Map();
  let node = unsafeWindow.document.getElementById("tree");
  node.addEventListener("select", buttons.update);

  addEventListener("keydown", function (event) {
    // Ignore events when not in edit mode.
    if (!node.editingColumn) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    let keycode = keyCodeFromEvent(event);
    let modifiers = modifiersFromEvent(event);
    node.inputField.value = getCombination(modifiers, null, keycode);

    if (isCompleteShortcut(event)) {
      overlays.set(tree.selected, modifiers, keycode);
      node.stopEditing(true);
      buttons.update();
      node.focus();
    }
  }, true);

  self.port.on("keys", function (keys) {
    allKeys = new Map();

    for (let key of keys) {
      let modifiers = new Set(key.modifiers || []);
      key.combination = getCombination(modifiers, key.key, key.keycode);
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
