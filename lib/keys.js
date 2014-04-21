/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const prefs = require("sdk/preferences/service");
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

function getActiveDocument() {
  return winUtils.activeBrowserWindow.document;
}

function querySelector(sel) {
  return getActiveDocument().querySelector(sel);
}

function querySelectorAll(sel) {
  return getActiveDocument().querySelectorAll(sel);
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

function valueForKeyCode(keyCode) {
  let {KeyEvent} = winUtils.activeBrowserWindow.document.defaultView;

  if (keyCode == "VK_BACK") {
    keyCode = "VK_BACK_SPACE";
  }

  return KeyEvent["DOM_" + keyCode] || null;
}

const MODIFIER_KEYS = {16: "shift", 17: "control", 18: "alt", 224: "meta"};

function parseModifiers(attr) {
  let modifiers = attr.toLowerCase().split(/[,\s]/);
  let idx = modifiers.indexOf("accel");

  if (idx > -1) {
    modifiers[idx] = MODIFIER_KEYS[prefs.get("ui.key.accelKey")] || "control";
  }

  return modifiers;
}

exports.get = function () {
  let keys = {};

  for (let key of querySelectorAll("key[id]")) {
    let id = key.getAttribute("id");
    let data = {id: id, label: getLabel(key)};

    if (key.hasAttribute("modifiers")) {
      data.modifiers = parseModifiers(key.getAttribute("modifiers"));
    }

    if (key.hasAttribute("keycode")) {
      let value = key.getAttribute("keycode");
      data.code = valueForKeyCode(value);

      let name = value.replace(/^VK_/, "");
      name = name[0] + name.substr(1).toLowerCase();
      data.text = name.replace(/_[a-z]/i, str => str[1].toUpperCase());
    } else {
      data.text = key.getAttribute("key").toUpperCase();
      data.code = data.text.charCodeAt(0);
    }

    // TODO Escape -> Esc
    // TODO Backspace -> Delete

    if (data.code && data.text) {
      keys[id] = data;
    }
  }

  return keys;
};
