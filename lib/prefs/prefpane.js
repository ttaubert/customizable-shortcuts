/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

exports.create = function (window) {
  function setupExtraButtons(tree) {
    let dialog = window.document.documentElement;
    let extra1 = dialog.getButton("extra1");
    let extra2 = dialog.getButton("extra2");

    extra1.label = "Reset";
    extra2.label = "Edit";
    extra1.disabled = extra2.disabled = true;

    // Reset button.
    extra1.addEventListener("command", () => {
      let row = tree.currentIndex;
      let column = tree.columns.getLastColumn();
      let id = tree.view.getCellValue(row, column);
      let key = keys.find(id);
      Overlays.removeByKey(key);
      extra1.disabled = true;
      tree.treeBoxObject.invalidateRow(row);
    });

    // Edit button.
    extra2.addEventListener("command", () => {
      let row = tree.currentIndex;
      let column = tree.columns.getLastColumn();
      tree.startEditing(row, column);
    });

    // Show or hide extra buttons when the prefpane is (de)selected.
    window.addEventListener("select", event => {
      if (event.target == dialog) {
        window.setTimeout(() => extra1.hidden = extra2.hidden = !pane.selected);
      }
    });
  }
};
