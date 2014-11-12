/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let keygroups = (function () {

  const KEY_GROUPS = {
    "Navigation": [
      "goBackKb", "goBackKb2", "goForwardKb", "goForwardKb2", "goHome",
      "openFileKb", /*"F5",*/ "key_reload", /*"Ctrl+F5", Ctrl+Shift+R,*/
      "key_stop", "key_stop_mac", "focusURLBar", "focusURLBar2"
    ],

    "Current Page": [
      /*"End", "Home", "F6", "Shift+F6",*/ "key_viewInfo", "key_viewSource",
      "printKb", "key_savePage", "key_fullZoomEnlarge", "key_fullZoomReduce",
      "key_fullZoomReset", "key_switchTextDirection"
    ],

    "Editing": [
      "key_copy", "key_cut", "key_delete", "key_paste", "key_redo",
      "key_selectAll", "key_undo"
    ],

    "Search": [
      "key_find", "key_findAgain", "key_findPrevious", "key_search",
      "key_search2", "key_findSelection"
    ],

    "Windows & Tabs": [
      "key_close", "key_closeWindow", "key_newNavigatorTab", "key_newNavigator",
      "key_undoCloseTab", "key_undoCloseWindow",
      "key_switchToNextTab", "key_switchToPrevTab",
      "key_selectTab1", "key_selectTab2", "key_selectTab3", "key_selectTab4",
      "key_selectTab5", "key_selectTab6", "key_selectTab7", "key_selectTab8",
      "key_selectLastTab", "key_tabview", "key_nextTabGroup", "key_prevTabGroup",
      "key_previousTabGroup", "key_minimizeWindow", "key_showAllTabs",
      "key_privatebrowsing",
    ],

    "Bookmarks & History": [
      "addBookmarkAsKb", "viewBookmarksSidebarKb", "viewBookmarksSidebarWinKb",
      "manBookmarkKb", "bookmarkAllTabsKb", "key_gotoHistory",
      "showAllHistoryKb", "key_sanitize", "key_sanitize_mac"
    ],

    "Tools": [
      "key_openDownloads", "key_openAddons", "key_preferencesCmdMac"
    ],

    "Developer Tools": [
      "key_webconsole", "key_errorConsole", "key_jsdebugger", "key_inspector",
      "key_styleeditor", "key_jsprofiler", "key_devToolbar", "key_responsiveUI",
      "key_scratchpad", "key_netmonitor", "key_devToolboxMenuItemF12",
      "key_browserConsole", "key_devToolboxMenuItem", "key_webide"
    ]
  };

  function group(keys) {
    let remaining = new Map(keys);
    let retval = new Map();

    for (let name in KEY_GROUPS) {
      let group = [];

      for (let id of KEY_GROUPS[name]) {
        if (remaining.has(id)) {
          group.push(keys.get(id));
          remaining.delete(id);
        }
      }

      if (group.length) {
        // Sort by label.
        group.sort((a, b) => a.label > b.label ? 1 : a.label < b.label ? -1 : 0);
        retval.set(name, group);
      }
    }

    if (remaining.size) {
      retval.set("Other", [...remaining.values()]);
    }

    return retval;
  }

  return {group: group};
})();
