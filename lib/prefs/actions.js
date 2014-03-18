/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {Windows} = require("util/windows");

let Actions = {
  _labels: {
    "focusURLBar": "Focus URL Bar",
    "focusURLBar2": "Focus URL Bar 2",
    "key_search2": "Web Search 2",
    "key_stop": "Stop",
    "goBackKb": "Back",
    "goBackKb2": "Back 2",
    "goForwardKb": "Forward",
    "goForwardKb2": "Forward 2",
    "key_close": "Close Tab",
    "key_undoCloseTab": "Undo Close Tab",
    "key_undoCloseWindow": "Undo Close Window",
    "key_toggleAddonBar": "Toggle Add-on Bar",
    "key_findPrevious": "Find Previous",
    "key_selectLastTab": "Select Last Tab",
    "key_selectTab1": "Select Tab 1",
    "key_selectTab2": "Select Tab 2",
    "key_selectTab3": "Select Tab 3",
    "key_selectTab4": "Select Tab 4",
    "key_selectTab5": "Select Tab 5",
    "key_selectTab6": "Select Tab 6",
    "key_selectTab7": "Select Tab 7",
    "key_selectTab8": "Select Tab 8",
    "key_tabview": "Tab Groups",
    "key_nextTabGroup": "Switch To Next Tab Group",
    "key_previousTabGroup": "Switch To Previous Tab Group",
    "key_minimizeWindow": "Minimize Window"
  },

  get menuItems() {
    if (!this._menuItems)
      this._loadMenuItems();

    return this._menuItems;
  },

  findByKey: function (key) {
    let label = key.getLabel();

    if (label)
      return label;

    let id = key.id;

    if (id in this._labels)
      return this._labels[id];

    // try to find a menuitem
    let menuitem = Windows.querySelector("menuitem[key=" + id + "]");
    if (menuitem && menuitem.hasAttribute("label"))
      return menuitem.getAttribute("label");

    return id;
  }
}

exports.Actions = Actions;
