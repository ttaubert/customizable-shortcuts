/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const prefs = require("sdk/preferences/service");
const winUtils = require("sdk/deprecated/window-utils");

const MODIFIER_KEYS = {16: "shift", 17: "control", 18: "alt", 224: "meta"};
const MODIFIER_NAMES = {control: "Ctrl", meta: "Meta", shift: "Shift", alt: "Alt"};

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
  "key_reload": "Reload",
  "key_reload2": "Reload",
  "key_selectLastTab": "Select Last Tab",
  "key_selectTab1": "Select Tab 1",
  "key_selectTab2": "Select Tab 2",
  "key_selectTab3": "Select Tab 3",
  "key_selectTab4": "Select Tab 4",
  "key_selectTab5": "Select Tab 5",
  "key_selectTab6": "Select Tab 6",
  "key_selectTab7": "Select Tab 7",
  "key_selectTab8": "Select Tab 8",
  "key_stop_mac": "Stop",
  "key_tabview": "Tab Groups",
  "key_nextTabGroup": "Switch To Next Tab Group",
  "key_previousTabGroup": "Switch To Previous Tab Group",
  "key_minimizeWindow": "Minimize Window"
};

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

function querySelector(sel) {
  return winUtils.activeBrowserWindow.document.querySelector(sel);
}

function querySelectorAll(sel) {
  return winUtils.activeBrowserWindow.document.querySelectorAll(sel);
}

function getLabel(element) {
  let label = element.getAttribute("label");

  if (label) {
    return label;
  }

  let id = element.id;

  if (id in KEY_LABELS) {
    return KEY_LABELS[id];
  }

  // Try to find a menuitem...
  let menuitem = querySelector("menuitem[key=" + id + "][label]");
  return menuitem ? menuitem.getAttribute("label") : id;
}

function getAccelKeyName() {
  return MODIFIER_KEYS[prefs.get("ui.key.accelKey")] || "control";
}

function getCombination(element) {
  let parts = [];

  if (element.hasAttribute("modifiers")) {
    let keys = new Set(element.getAttribute("modifiers").toLowerCase().split(/[,\s]/));

    if (keys.has("accel")) {
      keys.add(getAccelKeyName());
    }

    for (let name in MODIFIER_NAMES) {
      if (keys.has(name)) {
        parts.push(MODIFIER_NAMES[name] + "+");
      }
    }
  }

  let key = element.getAttribute("key").toUpperCase().charCodeAt(0);
  let keycode = element.getAttribute("keycode");

  if (key) {
    parts.push(String.fromCharCode(key));
  }

  if (keycode) {
    let keyName = keycode.replace(/^VK_/, "");
    keyName = keyName[0] + keyName.substr(1).toLowerCase();
    keyName = keyName.replace(/_[a-z]/i, str => str[1].toUpperCase());
    parts.push(keyName);
  }

  return parts.join("");
}

function group(keys) {
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
}

exports.get = function (term) {
  let keys = new Map();

  // Normalize search term.
  term = term.replace(/^\s+||s+$/, "").toLowerCase();

  for (let key of querySelectorAll("key[id]")) {
    let label = getLabel(key);
    let combination = getCombination(key);

    // Filter by the given term.
    if (!term || label.toLowerCase().contains(term) ||
        combination.toLowerCase().contains(term)) {
      let id = key.getAttribute("id");
      keys.set(id, {id: id, label: label, combination: combination});
    }
  }

  return group(keys);
};
