/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {Windows} = require("util/windows");
const {Shortcut} = require("core/shortcut");
const {Modifiers} = require("core/modifiers");

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

let Key = exports.Key = function (data) {
  let element = Windows.getElementById(data.id);

  this.id = data.id;
  this.element = element;
  this.key = element.getAttribute("key").toUpperCase().charCodeAt(0);
  this.keycode = element.getAttribute("keycode");

  if (element.hasAttribute("modifiers")) {
    let modifiers = element.getAttribute("modifiers").split(/[,\s]/);
    this.modifiers = new Modifiers({modifiers: modifiers});
  }

  this.shortcut = new Shortcut({key: this.key, keycode: this.keycode, modifiers: this.modifiers});
}

Key.prototype = {
  executeCommand: function () {
    if (this.element.hasAttribute("command")) {
      let command = this.element.getAttribute("command");
      command = Windows.getElementById(command);
      command && command.doCommand();
      return;
    }

    if (this.element.hasAttribute("oncommand")) {
      let sourceEvent = Windows.createEvent("Events");
      sourceEvent.initEvent("command", false, false);
      let event = Windows.createEvent("XULCommandEvents");
      event.initCommandEvent("command", true, false, null, null, false, false, false, false, sourceEvent);
      this.element.dispatchEvent(event);
      return;
    }

    let menuitem = Windows.querySelector("menuitem[key=" + this.id + "][command]");
    if (menuitem) {
      let command = menuitem.getAttribute("command");
      command = Windows.getElementById(command);
      command && command.doCommand();
    }
  },

  getLabel: function () {
    return this.element.getAttribute("label");
  },

  toString: function () {
    return this.id;
  }
};

let all = exports.all = (function () {
  let cache;

  return function () {
    if (!cache) {
      cache = new Map();

      for (let child of Windows.querySelectorAll("key")) {
        if (child.hasAttribute("id")) {
          let id = child.getAttribute("id");
          cache.set(id, new Key({id: id}));
        }
      }
    }

    return cache;
  };
})();

exports.find = function (id) {
  return all().get(id);
};

exports.filter = function () {
  let filtered = new Map();

  for (let key of all().values()) {
    if (findKeyLabel(key)) {
      filtered.set(key.id, key);
    }
  }

  return filtered;
};

exports.group = function (keys) {
  let remaining = new Map(keys);
  let retval = {};

  for (let name in KEY_GROUPS) {
    let group = [];

    for (let id of KEY_GROUPS[name]) {
      if (remaining.has(id)) {
        group.push(keys.get(id));
        remaining.delete(id);
      }
    }

    if (group.length) {
      retval[name] = group;
    }
  }

  if (remaining.size) {
    retval["Other"] = [...remaining.values()];
  }

  return retval;
};
