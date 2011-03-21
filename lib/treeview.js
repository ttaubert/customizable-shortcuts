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

let {Keys} = require("keys");
let {Cc, Ci} = require("chrome");
let {Overlays} = require("overlays");

let TreeView = function (filter) {
  this.keys = Keys.keys;

  if (filter) {
    filter = filter.toLowerCase();
    this.keys = this.keys.filter(function (key) {
      return (-1 < key.action.toLowerCase().indexOf(filter) ||
              -1 < key.shortcut.toString().toLowerCase().indexOf(filter))
    });
  }
}

TreeView.prototype = {
  getCellText: function (row, column) {
    let key = this.keys[row];
    if (!column.index)
      return key.action;

    let overlay = Overlays.findByKey(key);
    return (overlay ? overlay.shortcut : key.shortcut).toString();
  },

  getCellValue: function (row, column) {
    if (column.index)
      return Keys.keys.indexOf(this.keys[row]);
  },

  getCellProperties: function (row, column, props) {
    if (!column.index)
      return;

    let key = this.keys[row];
    if (!Overlays.findByKey(key))
      return;

    let aserv = Cc["@mozilla.org/atom-service;1"].getService(Ci.nsIAtomService);
    props.AppendElement(aserv.getAtom("overlayed"));
  },

  get rowCount() this.keys.length,
  setCellText: function (row, column, value) {},
  isEditable: function (row, column) { return column.index; },
  setTree: function(treebox) { this.treebox = treebox; },
  isContainer: function (row) { return false; },
  isSeparator: function (row) { return false; },
  isSorted: function () { return false; },
  getLevel: function (row) { return 0; },
  getImageSrc: function (row, column) {},
  getRowProperties: function (row, props) {},
  getColumnProperties: function (colid, column, props) {}
};

exports.TreeView = TreeView;
