/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const keys = require("core/keys");
const {Overlay, Overlays} = require("core/overlay");
const {Shortcut} = require("core/shortcut");

function PreferenceTree(window) {
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
};

exports.PreferenceTree = PreferenceTree;
