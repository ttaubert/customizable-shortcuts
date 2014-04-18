/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let treeview = (function () {

  function buildRows(groups) {
    let rows = [];

    for (let group of groups) {
      let parentIdx = rows.push(group) - 1;

      if (group.open) {
        rows.push(...[
          {type: "key", key: key, parentIdx: parentIdx} for (key of group.keys)
        ]);
      }
    }

    return rows;
  }

  function create(keys) {
    let groups = [
      {type: "group", name: gname, parentIdx: -1, open: true, keys: gkeys}
      for ([gname, gkeys] of keygroups.group(keys))
    ];

    let rows = buildRows(groups);

    return {
      get rowCount() rows.length,

      isContainer: function (idx) {
        return rows[idx].type == "group";
      },

      isEditable: function (idx, column) {
        return column.index && !this.isContainer(idx);
      },

      isContainerOpen: function (idx) {
        return rows[idx].open;
      },

      getLevel: function (idx) {
        return +!this.isContainer(idx);
      },

      getParentIndex: function (idx) {
        return rows[idx].parentIdx;
      },

      toggleOpenState: function (idx) {
        let row = rows[idx];

        let numRows = -row.keys.length;
        if (row.open = !row.open) {
          numRows *= -1;
        }

        rows = buildRows(groups);
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
        let row = rows[idx];

        if (!row) {
          return null;
        }

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
          return rows[idx].key.id;
        }
      },

      getCellProperties: function (idx, column) {
        if (this.isContainer(idx) || !column.index) {
          return "";
        }

        let props = [];
        let key = rows[idx].key;

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
  }

  return {create: create};
})();
