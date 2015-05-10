/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const gTree = (function () {

  let node = unsafeWindow.document.getElementById("tree");
  node.addEventListener("select", gButtons.update);

  // Listen for blur events to determine when to close the panel. We take care
  // of that manually to support Alt+ and Super+ shortcuts on Linux. Some
  // window managers steal focus immediately and would hide the panel.
  addEventListener("blur", function (event) {
    // Don't propagate the event to the tree. We want to continue
    // editing if the edit mode's input field was the active element.
    if (event.originalTarget == node.inputField.inputField) {
      event.stopPropagation();
    }

    // Wait a tick.
    setTimeout(() => {
      if (!document.hasFocus()) {
        // If the panel isn't focused but another window or app, hide it.
        self.port.emit("hide");
      } else if (document.activeElement != node.inputField.inputField) {
        // If the panel is still focused but the active element
        // isn't the edit mode's input field then stop editing.
        gTree.stopEditing();
      }
    });
  }, true);

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
    let hotkey = gHotKeys.get(id);
    let conflict = gConflicts.find(null, modifiers, event.key);

    // Do nothing if the overlay's shortcut didn't change.
    if (!conflict || conflict.id != id) {
      // Disable any conflicting shortcuts and show a warning.
      gConflicts.findAndDisable(id, modifiers, event.key);

      // Check if the shortcut was manually reset to its default value.
      if (hotkey.modifiers == modifiers && hotkey.key == event.key) {
        // Remove leftovers.
        gOverlays.clear(id);
      } else {
        // Store the new overlay.
        gOverlays.set(id, modifiers, event.key);
      }
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
      if (!node.editingColumn) {
        let row = node.currentIndex;
        let column = node.columns.getLastColumn();
        node.startEditing(row, column);
      }
    },

    invalidateSelectedRow() {
      let row = node.currentIndex;
      node.treeBoxObject.invalidateRow(row);
    },

    stopEditing() {
      node.stopEditing(false);
    }
  };
})();
