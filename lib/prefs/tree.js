/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const keys = require("core/keys");
const {Overlay, Overlays} = require("core/overlay");
const {Shortcut} = require("core/shortcut");

function PreferenceTree(window) {
  this.window.addEventListener("keydown", function (e) self._onKeyDown(e), true);
  this.element.addEventListener("select", function (e) self._onSelect(e), false);
}

PreferenceTree.prototype = {
  _onSelect: function (event) {
    let prefwindow = this.window.document.querySelector("prefwindow");
    let row = this.element.currentIndex;
    let column = this.element.columns.getLastColumn();
    let id = this.element.view.getCellValue(row, column);
    let key = keys.find(id);
    prefwindow.getButton("extra1").disabled = !Overlays.findByKey(key);
    prefwindow.getButton("extra2").disabled = false;
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

    if (shortcut.isComplete()) {
      new Overlay({key: keys.find(id), shortcut: shortcut});

      this.element.stopEditing(true);
      this._onSelect(event);
    }
  },
};

exports.PreferenceTree = PreferenceTree;
