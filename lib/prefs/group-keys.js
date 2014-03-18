/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const GROUPS = {
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
    "key_scratchpad"
  ]
};

exports.groupKeys = function (keys) {
  let map = new Map();
  keys.forEach(function (key) map.set(key.id, key));

  let groups = new Map();
  for (let name in GROUPS) {
    let group = [];

    for (let id of GROUPS[name]) {
      if (map.has(id)) {
        group.push(map.get(id));
        map.delete(id);
      }
    }

    if (group.length) {
      groups.set(name, group);
    }
  }

  if (map.size) {
    groups.set("Other", map.values());
  }

  return groups;
};
