/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let treeview = (function () {

  let filterTerm = "";
  let tree = unsafeWindow.document.getElementById("tree");

  // TODO no need to support multiple instances
  function TreeView(data) {
    this._buildGroups(data);
    this._buildRows();
  }

  TreeView.prototype = {
    _buildGroups: function (map) {
      this.groups = [
        {type: "group", name: gname, parentIdx: -1, open: true, keys: map[gname]}
        for (gname of Object.keys(map))
      ];
    },

    _buildRows: function () {
      this.rows = [];

      for (let group of this.groups) {
        let parentIdx = this.rows.push(group) - 1;

        if (group.open) {
          this.rows.push(...[
            {type: "key", key: key, parentIdx: parentIdx} for (key of group.keys)
          ]);
        }
      }
    },

    get rowCount() this.rows.length,

    isContainer: function (idx) {
      return ("group" == this.rows[idx].type);
    },

    isEditable: function (idx, column) {
      return column.index && !this.isContainer(idx);
    },

    isContainerOpen: function (idx) {
      return this.rows[idx].open;
    },

    getLevel: function (idx) {
      return +!this.isContainer(idx);
    },

    getParentIndex: function (idx) {
      return this.rows[idx].parentIdx;
    },

    toggleOpenState: function (idx) {
      let row = this.rows[idx];

      let numRows = -row.keys.length;
      if (row.open = !row.open) {
        numRows *= -1;
      }

      this._buildRows();
      this.treebox.rowCountChanged(idx + 1, numRows);
      this.treebox.invalidateRow(idx);
    },

    hasNextSibling: function (idx, after) {
      let level = this.getLevel(idx);
      for (let t = after + 1; t < this.rowCount; t++) {
        let nextLevel = this.getLevel(t);
        if (nextLevel == level) {
          return true;
        }

        if (nextLevel < level) {
          return false;
        }
      }
    },

    getCellText: function (idx, column) {
      let row = this.rows[idx];

      if (this.isContainer(idx)) {
        return column.index ? "" : row.name;
      }

      let key = row.key;

      if (column.index == 0) {
        return key.label;
      }

      // Show the new shortcut if overridden.
      if (overlays.has(key.id)) {
        let overlay = overlays.get(key.id);
        return getCombination(overlay.modifiers, null, overlay.keycode);
      }

      return key.combination;
    },

    getCellValue: function (idx, column) {
      if (!this.isContainer(idx)) {
        return this.rows[idx].key.id;
      }
    },

    getCellProperties: function (idx, column) {
      if (this.isContainer(idx) || !column.index) {
        return;
      }

      let props = [];
      let key = this.rows[idx].key;

      if (overlays.has(key.id)) {
        props.push("custom");
      }

      /*if (Overlays.findByCustomShortcut(key.shortcut)) {
        props.push("overridden"); // TODO
      }*/

      return props.join(" ");
    },

    setTree: function (treebox) {
      this.treebox = treebox;
    },

    isContainerEmpty: function () false,
    setCellText: function () {},
    isSeparator: function () false,
    isSorted: function () false,
    getImageSrc: function () {},
    getRowProperties: function () {},
    getColumnProperties: function () {}
  };

  return {
    get selected() {
      let row = tree.currentIndex;
      let column = tree.columns.getLastColumn();
      return tree.view.getCellValue(row, column);
    },

    get isEditing() {
      return !!tree.editingColumn;
    },

    update: function () {
      let keys = new Map();

      for (let [id, key] of gKeys) {
        // Filter by the current term.
        if (!filterTerm ||
            key.label.toLowerCase().contains(filterTerm) ||
            key.combination.toLowerCase().contains(filterTerm)) {
          keys.set(id, key);
        }
      }

      tree.view = new TreeView(keygroups.group(keys));
    },

    filter: function (term) {
      filterTerm = term;
      this.update();
    },

    editSelectedRow: function () {
      let row = tree.currentIndex;
      let column = tree.columns.getLastColumn();
      tree.startEditing(row, column);
    },

    updateInputField: function (value) {
      tree.inputField.value = value;
    },

    stopEditing: function () {
      tree.stopEditing(true);
    },

    invalidateSelectedRow: function () {
      let row = tree.currentIndex;
      tree.treeBoxObject.invalidateRow(row);
    }
  };
})();
