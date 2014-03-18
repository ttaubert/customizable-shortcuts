/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {Keys} = require("core/key");
const {Cc, Ci} = require("chrome");
const {Groups} = require("prefs/groups");
const {Actions} = require("prefs/actions");
const {Overlays} = require("core/overlay");

function TreeView(filter) {
  let keys = [];
  for (let id in Keys.keys)
    keys.push(Keys.keys[id]);

  if (filter) {
    filter = filter.toLowerCase();
    keys = keys.filter(function (key) {
      return (-1 < Actions.findByKey(key).toLowerCase().indexOf(filter) ||
              -1 < key.shortcut.toString().toLowerCase().indexOf(filter))
    });
  }

  this._buildGroups(keys);
  this._buildRows();
}

TreeView.prototype = {
  _buildGroups: function (keys) {
    this.groups = [];

    let gkeys = Groups.groupKeys(keys);

    for (let name in gkeys) {
      let group = {type: "group", name: name, parentIdx: -1, open: true, keys: gkeys[name]};
      this.groups.push(group);
    }
  },

  _buildRows: function () {
    this.rows = [];
    let self = this;

    this.groups.forEach(function (group) {
      let parentIdx = self.rows.push(group) - 1;

      if (group.open) {
        group.keys.forEach(function (key) {
          self.rows.push({type: "key", key: key, parentIdx: parentIdx});
        });
      }
    });
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
    if (row.open = !row.open)
      numRows *= -1;

    this._buildRows();
    this.treebox.rowCountChanged(idx + 1, numRows);
    this.treebox.invalidateRow(idx);
  },

  hasNextSibling: function (idx, after) {
    let level = this.getLevel(idx);
    for (let t = after + 1; t < this.rowCount; t++) {
      let nextLevel = this.getLevel(t);
      if (nextLevel == level)
        return true;
      if (nextLevel < level)
        return false;
    }
  },

  getCellText: function (idx, column) {
    let row = this.rows[idx];
    if (this.isContainer(idx))
      return (column.index ? "" : row.name);

    let key = row.key;
    if (!column.index)
      return Actions.findByKey(key);

    let overlay = Overlays.findByKey(key);
    return (overlay ? overlay.shortcut : key.shortcut).toString();
  },

  getCellValue: function (idx, column) {
    if (!this.isContainer(idx))
      return this.rows[idx].key.toString();
  },

  getCellProperties: function (idx, column) {
    if (this.isContainer(idx))
      return;

    if (!column.index)
      return;

    let props = [];
    let key = this.rows[idx].key;

    if (Overlays.findByKey(key))
      props.push("custom");

    if (Overlays.findByCustomShortcut(key.shortcut))
      props.push("overridden");

    return props.join(" ");
  },

  setTree: function (treebox) {
    this.treebox = treebox;
  },

  isContainerEmpty: function (idx) false,
  setCellText: function (idx, column, value) {},
  isSeparator: function (idx) false,
  isSorted: function () false,
  getImageSrc: function (idx, column) {},
  getRowProperties: function (idx, props) {},
  getColumnProperties: function (colid, column, props) {}
};

exports.TreeView = TreeView;
