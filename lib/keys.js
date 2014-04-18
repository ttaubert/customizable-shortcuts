/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const winUtils = require("sdk/deprecated/window-utils");

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

exports.get = function () {
  let keys = [];

  for (let key of querySelectorAll("key[id]")) {
    let label = getLabel(key);
    let data = {id: key.getAttribute("id"), label: label};

    if (key.hasAttribute("modifiers")) {
      data.modifiers = key.getAttribute("modifiers").toLowerCase().split(/[,\s]/);
    }

    // TODO convert key to keycode for simpler handling?
    data.key = key.getAttribute("key").toUpperCase().charCodeAt(0);
    data.keycode = key.getAttribute("keycode");

    keys.push(data);
  }

  return keys;
};
