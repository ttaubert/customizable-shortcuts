/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const gTreeView = (function () {

  function buildRows(groups) {
    let rows = [];

    for (let group of groups) {
      let parentIdx = rows.push(group) - 1;

      if (group.open) {
        rows.push(...group.keys.map(key => {
          return {type: "key", key, parentIdx};
        }));
      }
    }

    return rows;
  }

  function create(keys) {
    let groups = [...gKeyGroups.group(keys).entries()].map(([name, keys]) => {
      return {type: "group", name, parentIdx: -1, open: true, keys};
    });

    let rows = buildRows(groups);

    return {
      get rowCount() rows.length,

      isContainer(idx) {
        return rows[idx].type == "group";
      },

      isEditable(idx, column) {
        if (column.index == 0 || this.isContainer(idx)) {
          return false;
        }

        let key = rows[idx].key;
        let overlay = gOverlays.get(key.id);
        return !overlay || !overlay.disabled;
      },

      isContainerOpen(idx) {
        return rows[idx].open;
      },

      getLevel(idx) {
        return +!this.isContainer(idx);
      },

      getParentIndex(idx) {
        return rows[idx].parentIdx;
      },

      toggleOpenState(idx) {
        let row = rows[idx];

        let numRows = -row.keys.length;
        if (row.open = !row.open) {
          numRows *= -1;
        }

        rows = buildRows(groups);
        this.treebox.rowCountChanged(idx + 1, numRows);
        this.treebox.invalidateRow(idx);
      },

      hasNextSibling(idx, after) {
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

      getCellText(idx, column) {
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
        let overlay = gOverlays.get(key.id);
        if (overlay && !overlay.disabled) {
          key = overlay;
        }

        return gHotKeys.getCombination(key);
      },

      getCellValue(idx, column) {
        if (!this.isContainer(idx)) {
          return rows[idx].key.id;
        }
      },

      getCellProperties(idx, column) {
        if (this.isContainer(idx)) {
          return "";
        }

        let props = [];
        let key = rows[idx].key;

        let overlay = gOverlays.get(key.id);
        if (column.index && overlay && !overlay.disabled) {
          props.push("custom");
        }

        if (overlay && overlay.disabled) {
          props.push("disabled");
        }

        return props.join(" ");
      },

      setTree(treebox) {
        this.treebox = treebox;
      },

      isContainerEmpty() { return false; },
      setCellText() {},
      isSeparator() { return false; },
      isSorted() { return false; },
      getImageSrc() {},
      getRowProperties() {},
      getColumnProperties() {},
      cycleHeader() {}
    };
  }

  return {create};
})();
