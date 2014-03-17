/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let {Keys} = require("core/key");
let {Overlay, Overlays} = require("core/overlay");
let {Shortcut} = require("core/shortcut");

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
  this.element.addEventListener("select", function (e) self._onSelect(e), false);

  let cols = this._createElement("treecols", this.element);

  let colAction = this._createElement("treecol", cols);
  colAction.setAttribute("id", "colAction");
  colAction.setAttribute("label", "Action");
  colAction.setAttribute("flex", 1);
  colAction.setAttribute("primary", true);

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
    let prefwindow = this.window.document.querySelector("prefwindow");
    let row = this.element.currentIndex;
    let column = this.element.columns.getLastColumn();
    let id = this.element.view.getCellValue(row, column);
    let key = Keys.keys[id];
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
    let id = this.element.view.getCellValue(editingRow, editingColumn);

    if (shortcut.isComplete())
      new Overlay({key: Keys.keys[id], shortcut: shortcut});
  },

  toElement: function () {
    return this.element;
  }
};

exports.PreferenceTree = PreferenceTree;
