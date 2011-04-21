/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is
 * Tim Taubert <tim@timtaubert.de>
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

let {Keys} = require("core/key");
let {Cc, Ci} = require("chrome");
let {Groups} = require("prefs/groups");
let {Actions} = require("prefs/actions");
let {Overlays} = require("core/overlay");

let TreeView = function (filter) {
  let keys = [];
  for (let [id, key] in Iterator(Keys.keys))
    keys.push(key);

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
  get atomService() {
    if (!this._asvc)
      this._asvc = Cc["@mozilla.org/atom-service;1"].getService(Ci.nsIAtomService);

    return this._asvc;
  },

  _buildGroups: function (keys) {
    this.groups = [];

    for (let [name, keys] in Iterator(Groups.groupKeys(keys))) {
      let group = {type: "group", name: name, parentIdx: -1, open: true, keys: keys};
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

  getCellProperties: function (idx, column, props) {
    if (this.isContainer(idx))
      return;

    if (!column.index)
      return;

    let key = this.rows[idx].key;

    if (Overlays.findByKey(key))
      props.AppendElement(this.atomService.getAtom("custom"));

    if (Overlays.findByCustomShortcut(key.shortcut))
      props.AppendElement(this.atomService.getAtom("overridden"));
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
