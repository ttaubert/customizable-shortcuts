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
let {Overlay, Overlays} = require("overlays");
let {Shortcut} = require("shortcuts");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

let PreferenceTree = function (window) {
  let self = this;

  this.window = window;
  this.window.addEventListener("keypress", function (e) self._onKeyPress(e), true);
  this.window.addEventListener("keydown", function (e) self._onKeyDown(e), true);

  this.element = this._createElement("tree");
  this.element.setAttribute("id", "shortcutsTree");
  this.element.setAttribute("seltype", "single");
  this.element.setAttribute("editable", true);
  this.element.setAttribute("hidecolumnpicker", true);
  this.element.setAttribute("disableKeyNavigation", true);
  this.element.setAttribute("flex", 1);
  this.element.addEventListener("select", function (e) self._onSelect(e), false);

  let cols = this._createElement("treecols", this.element);

  let colAction = this._createElement("treecol", cols);
  colAction.setAttribute("id", "colAction");
  colAction.setAttribute("label", "Action");
  colAction.setAttribute("flex", 1);

  let colShortcut = this._createElement("treecol", cols);
  colShortcut.setAttribute("id", "colShortcut");
  colShortcut.setAttribute("label", "Shortcut");
  colShortcut.setAttribute("editable", true);
  colShortcut.setAttribute("flex", 1);

  this._createElement("treechildren", this.element);
}

PreferenceTree.prototype = {
  _createElement: function (tag, parent) {
    let element = this.window.document.createElementNS(XUL_NS, tag);
    parent && parent.appendChild(element);
    return element;
  },

  _onSelect: function (event) {
    let prefwindow = this.window.document.getElementsByTagName("prefwindow")[0];
    let row = this.element.currentIndex;
    let column = this.element.columns.getLastColumn();
    let index = this.element.view.getCellValue(row, column);
    let key = Keys.keys[index];
    prefwindow.getButton("extra1").disabled = !Overlays.findByKey(key);
    prefwindow.getButton("extra2").disabled = false;
  },

  _onKeyPress: function (event) {
    if (!this.element.editingColumn)
      return;

    event.preventDefault();
    event.stopPropagation();

    this.element.stopEditing(true);
    this._onSelect(event);
  },

  _onKeyDown: function (event) {
    if (!this.element.editingColumn)
      return;

    event.preventDefault();
    event.stopPropagation();

    let shortcut = Shortcut.fromEvent(event);
    this.element.inputField.value = shortcut.toString();

    let {editingRow, editingColumn} = this.element;
    let index = this.element.view.getCellValue(editingRow, editingColumn);

    if (shortcut.isComplete())
      new Overlay({key: Keys.keys[index], shortcut: shortcut});
  },

  toElement: function () {
    return this.element;
  }
};

exports.PreferenceTree = PreferenceTree;
