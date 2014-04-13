/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

function TreeView(data) {
  this._buildGroups(data);
  this._buildRows();
}

TreeView.prototype = {
  _buildGroups: function (map) {
    this.groups = [];

    for (let gname of Object.keys(map)) {
      let group = {type: "group", name: gname, parentIdx: -1, open: true, keys: map[gname]};
      this.groups.push(group);
    }
  },

  _buildRows: function () {
    this.rows = [];

    for (let group of this.groups) {
      let parentIdx = this.rows.push(group) - 1;

      if (group.open) {
        for (let key of group.keys) {
          this.rows.push({type: "key", key: key, parentIdx: parentIdx});
        }
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
    if (this.isContainer(idx))
      return (column.index ? "" : row.name);

    let key = row.key;
    return column.index ? key.combination : key.label;
  },

  getCellValue: function (idx, column) {
    if (!this.isContainer(idx)) {
      return this.rows[idx].key.id;
    }
  },

  getCellProperties: function (idx, column) {
    if (this.isContainer(idx)) {
      return;
    }

    if (!column.index) {
      return;
    }

    let props = [];
    let key = this.rows[idx].key;

    /*if (Overlays.findByKey(key)) {
      props.push("custom");
    }

    if (Overlays.findByCustomShortcut(key.shortcut)) {
      props.push("overridden");
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
