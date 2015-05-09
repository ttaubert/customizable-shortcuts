/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const gTree = (function () {

  let node = unsafeWindow.document.getElementById("tree");
  node.addEventListener("select", gButtons.update);

  addEventListener("keydown", function (event) {
    // Ignore events when not in edit mode.
    if (!node.editingColumn) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    let modifiers = gModifiers.fromEvent(event);
    node.inputField.value = gModifiers.toText(modifiers);

    // Bail out if the shortcut isn't complete yet.
    if (gModifiers.isModifier(event.key)) {
      return;
    }

    let id = gTree.selected;
    let conflict = gConflicts.find(null, modifiers, event.key);

    // Do nothing if the shortcut didn't change.
    if (!conflict || conflict.id != id) {
      // Disable any conflicting shortcuts and show a warning.
      gConflicts.findAndDisable(id, modifiers, event.key);

      // Store the new overlay.
      gOverlays.set(id, modifiers, event.key);
    }

    node.stopEditing(true);
    gButtons.update();
    node.focus();
  }, true);

  return {
    get selected() {
      let row = node.currentIndex;
      let column = node.columns.getLastColumn();
      return node.view.getCellValue(row, column);
    },

    filter(term) {
      node.view = gTreeView.create(gHotKeys.filter(hotkey => {
        return !term ||
               hotkey.label.toLowerCase().indexOf(term) > -1 ||
               gHotKeys.getCombination(hotkey).toLowerCase().indexOf(term) > -1;
      }));
    },

    editSelectedRow() {
      let row = node.currentIndex;
      let column = node.columns.getLastColumn();
      node.startEditing(row, column);
    },

    invalidateSelectedRow() {
      let row = node.currentIndex;
      node.treeBoxObject.invalidateRow(row);
    }
  };
})();
