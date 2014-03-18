/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let Groups = {
  groups: {
    "Navigation": [
      "goBackKb", "goBackKb2", "goForwardKb", "goForwardKb2", "goHome",
      "openFileKb", /*"F5",*/ "key_reload", /*"Ctrl+F5", Ctrl+Shift+R,*/
      "key_stop"
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
      "key_tabview", "key_nextTabGroup", "key_previousTabGroup"
    ],

    "History": [
      "key_gotoHistory", "showAllHistoryKb"
    ],

    "Bookmarks": [
      "addBookmarkAsKb", "viewBookmarksSidebarKb", "viewBookmarksSidebarWinKb",
      "manBookmarkKb", "bookmarkAllTabsKb"
    ],

    "Tools": [
      "key_openDownloads", "key_openAddons", "key_errorConsole",
      "key_webConsole", "key_privatebrowsing", "key_sanitize",
      "key_sanitize_mac"
    ]
  },

  groupKeys: function (keys) {
    let map = {};
    keys.forEach(function (key) map[key.id] = key);

    let groups = [];
    for (let name in this.groups) {
      let group = this.groups[name].map(function (id) {
        if (id in map) {
          let key = map[id];
          delete map[id];
          return key;
        }
      }).filter(function (key) key);

      if (group.length)
        groups[name] = group;
    }

    if (Object.keys(map).length) {
      let group = groups["Other"] = [];
      for (let id in map)
        group.push(map[id]);
    }

    return groups;
  }
}

exports.Groups = Groups;
