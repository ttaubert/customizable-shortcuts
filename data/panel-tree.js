/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let tree = (function () {

  let node = unsafeWindow.document.getElementById("tree");
  node.addEventListener("select", buttons.update);

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

    let id = tree.selected;
    let conflict = conflicts.find(null, modifiers, event.keyCode);

    // Do nothing if the shortcut didn't change.
    if (!conflict || conflict.id != id) {
      // Disable any conflicting shortcuts and show a warning.
      conflicts.findAndDisable(id, modifiers, event.keyCode);

      let text = event.key[0].toUpperCase() + event.key.slice(1).toLowerCase();
      node.inputField.value += text;
      overlays.set(id, modifiers, event.keyCode, text);
    }

    node.stopEditing(true);
    buttons.update();
    node.focus();
  }, true);

  // Render the tree as soon as we received all keys.
  keys.addListener(() => tree.filter());

  return {
    get selected() {
      let row = node.currentIndex;
      let column = node.columns.getLastColumn();
      return node.view.getCellValue(row, column);
    },

    filter: function (term) {
      node.view = treeview.create(keys.filter(key => {
        let label = key.label.toLowerCase();
        let combination = key.combination.toLowerCase();
        return !term || label.contains(term) || combination.contains(term);
      }));
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
