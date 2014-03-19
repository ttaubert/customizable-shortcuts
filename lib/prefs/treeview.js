/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const keys = require("core/keys");
const {Windows} = require("util/windows");
const {Overlays} = require("core/overlay");

const KEY_GROUPS = {
  "Navigation": [
    "goBackKb", "goBackKb2", "goForwardKb", "goForwardKb2", "goHome",
    "openFileKb", /*"F5",*/ "key_reload", /*"Ctrl+F5", Ctrl+Shift+R,*/
    "key_stop", "key_stop_mac", "focusURLBar"
  ],

  "Current Page": [
    /*"End", "Home", "F6", "Shift+F6",*/ "key_viewInfo", "key_viewSource",
    "printKb", "key_savePage", "key_fullZoomEnlarge", "key_fullZoomReduce",
    "key_fullZoomReset"
  ],

  "Editing": [
    "key_copy", "key_cut", "key_delete", "key_paste", "key_redo",
    "key_selectAll", "key_undo"
  ],

  "Search": [
    "key_find", "key_findAgain", "key_findPrevious", "key_search",
    "key_search2"
  ],

  "Windows & Tabs": [
    "key_close", "key_closeWindow", "key_newNavigatorTab", "key_newNavigator",
    "key_undoCloseTab", "key_undoCloseWindow", "key_selectTab1",
    "key_selectTab2", "key_selectTab3", "key_selectTab4", "key_selectTab5",
    "key_selectTab6", "key_selectTab7", "key_selectTab8", "key_selectLastTab",
    "key_tabview", "key_nextTabGroup", "key_previousTabGroup",
    "key_minimizeWindow", "key_showAllTabs"
  ],

  "History": [
    "key_gotoHistory", "showAllHistoryKb"
  ],

  "Bookmarks": [
    "addBookmarkAsKb", "viewBookmarksSidebarKb", "viewBookmarksSidebarWinKb",
    "manBookmarkKb", "bookmarkAllTabsKb"
  ],

  "Tools": [
    "key_openDownloads", "key_openAddons", "key_privatebrowsing",
    "key_sanitize", "key_sanitize_mac"
  ],

  "Developer Tools": [
    "key_webconsole", "key_errorConsole", "key_jsdebugger", "key_inspector",
    "key_styleeditor", "key_jsprofiler", "key_devToolbar", "key_responsiveUI",
    "key_scratchpad", "key_netmonitor", "key_devToolboxMenuItemF12",
    "key_browserConsole", "key_devToolboxMenuItem"
  ]
};

const KEY_LABELS = {
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
};

function findKeyLabel(key) {
  let label = key.getLabel();

  if (label) {
    return label;
  }

  let id = key.id;

  if (id in KEY_LABELS) {
    return KEY_LABELS[id];
  }

  // try to find a menuitem
  let menuitem = Windows.querySelector("menuitem[key=" + id + "][label]");
  return menuitem ? menuitem.getAttribute("label") : id;
}

let TreeView = exports.TreeView = function (term) {
  function filter(key) {
    return findKeyLabel(key).toLowerCase().contains(term) ||
           key.shortcut.toString().toLowerCase().contains(term);
  }

  this._buildGroups(term ? keys.filter(filter) : keys.all());
  this._buildRows();
};

TreeView.prototype = {
  _buildGroups: function (map) {
    this.groups = [];

    for (let [gname, gkeys] of keys.group(map, KEY_GROUPS, "Other")) {
      let group = {type: "group", name: gname, parentIdx: -1, open: true, keys: gkeys};
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
    if (!column.index) {
      return findKeyLabel(key);
    }

    let overlay = Overlays.findByKey(key);
    return (overlay ? overlay.shortcut : key.shortcut).toString();
  },

  getCellValue: function (idx, column) {
    if (!this.isContainer(idx)) {
      return this.rows[idx].key.toString();
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

    if (Overlays.findByKey(key)) {
      props.push("custom");
    }

    if (Overlays.findByCustomShortcut(key.shortcut)) {
      props.push("overridden");
    }

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
