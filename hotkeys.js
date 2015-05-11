/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const self = require("sdk/self");
const prefs = require("sdk/preferences/service");
const winUtils = require("sdk/deprecated/window-utils");

// Import shared modifiers code.
const gModifiers = eval(self.data.load("shared-modifiers.js") + "gModifiers");

const HOTKEY_LABELS = {
  "focusURLBar": "Focus URL Bar",
  "focusURLBar2": "Focus URL Bar",
  "key_search": "Web Search",
  "key_search2": "Web Search",
  "key_stop": "Stop",
  "key_stop_mac": "Stop",
  "goHome": "Home",
  "goBackKb": "Back",
  "goBackKb2": "Back 2",
  "goForwardKb": "Forward",
  "goForwardKb2": "Forward",
  "key_close": "Close Tab",
  "key_undoCloseTab": "Undo Close Tab",
  "key_undoCloseWindow": "Undo Close Window",
  "key_toggleAddonBar": "Toggle Add-on Bar",
  "key_findPrevious": "Find Previous",
  "key_findSelection": "Find Selection",
  "key_devToolboxMenuItemF12": "Toggle Tools",
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
  "key_tabview": "Tab Groups",
  "key_minimizeWindow": "Minimize Window",
  "key_sanitize_mac": "Clear Recent History…",
  "key_fullScreen_old": "Enter Full Screen",
  "focusChatBar": "Focus Chat Bar"
};

const KEY_CODE_TO_DOM_KEY_NAME = {
  VK_MENU: "Alt",
  VK_LMENU: "Alt",
  VK_RMENU: "Alt",
  VK_CAPITAL: "CapsLock",
  VK_CONTROL: "Control",
  VK_LCONTROL: "Control",
  VK_RCONTROL: "Control",
  VK_NUMLOCK: "NumLock",
  VK_LWIN: "OS",
  VK_RWIN: "OS",
  VK_SCROLL: "ScrollLock",
  VK_SHIFT: "Shift",
  VK_LSHIFT: "Shift",
  VK_RSHIFT: "Shift",
  VK_RETURN: "Enter",
  VK_TAB: "Tab",
  VK_DOWN: "ArrowDown",
  VK_LEFT: "ArrowLeft",
  VK_RIGHT: "ArrowRight",
  VK_UP: "ArrowUp",
  VK_END: "End",
  VK_HOME: "Home",
  VK_NEXT: "PageDown",
  VK_PRIOR: "PageUp",
  VK_BACK: "Backspace",
  VK_CLEAR: "Clear",
  VK_OEM_CLEAR: "Clear",
  VK_CRSEL: "CrSel",
  VK_DELETE: "Delete",
  VK_EREOF: "EraseEof",
  VK_EXSEL: "ExSel",
  VK_INSERT: "Insert",
  VK_ACCEPT: "Accept",
  VK_ATTN: "Attn",
  VK_CANCEL: "Cancel",
  VK_APPS: "ContextMenu",
  VK_ESCAPE: "Escape",
  VK_EXECUTE: "Execute",
  VK_HELP: "Help",
  VK_PAUSE: "Pause",
  VK_PLAY: "Play",
  VK_SELECT: "Select",
  VK_SNAPSHOT: "PrintScreen",
  VK_SLEEP: "Standby",
  VK_OEM_ATTN: "Alphanumeric",
  VK_CONVERT: "Convert",
  VK_FINAL: "FinalMode",
  VK_MODECHANGE: "ModeChange",
  VK_NONCONVERT: "NonConvert",
  VK_HANGUL: "HangulMode",
  VK_HANJA: "HanjaMode",
  VK_JUNJA: "JunjaMode",
  VK_OEM_AUTO: "Hankaku",
  VK_OEM_COPY: "Hiragana",
  VK_KANA: "KanaMode",
  VK_ATTN: "KanaMode",
  VK_KANJI: "KanjiMode",
  VK_OEM_FINISH: "Katakana",
  VK_OEM_BACKTAB: "Romaji",
  VK_OEM_ENLW: "Zenkaku",
  VK_F1: "F1",
  VK_F2: "F2",
  VK_F3: "F3",
  VK_F4: "F4",
  VK_F5: "F5",
  VK_F6: "F6",
  VK_F7: "F7",
  VK_F8: "F8",
  VK_F9: "F9",
  VK_F10: "F10",
  VK_F11: "F11",
  VK_F12: "F12",
  VK_F13: "F13",
  VK_F14: "F14",
  VK_F15: "F15",
  VK_F16: "F16",
  VK_F17: "F17",
  VK_F18: "F18",
  VK_F19: "F19",
  VK_F20: "F20",
  VK_F21: "F21",
  VK_F22: "F22",
  VK_F23: "F23",
  VK_F24: "F24",
  VK_MEDIA_PLAY_PAUSE: "MediaPlayPause",
  VK_LAUNCH_MEDIA_SELECT: "MediaSelect",
  VK_MEDIA_STOP: "MediaStop",
  VK_MEDIA_NEXT_TRACK: "MediaTrackNext",
  VK_MEDIA_PREV_TRACK: "MediaTrackPrevious",
  VK_VOLUME_DOWN: "VolumeDown",
  VK_VOLUME_UP: "VolumeUp",
  VK_VOLUME_MUTE: "VolumeMute",
  VK_LAUNCH_MAIL: "LaunchMail",
  VK_LAUNCH_APP1: "LaunchApplication1",
  VK_LAUNCH_APP2: "LaunchApplication2",
  VK_BROWSER_BACK: "BrowserBack",
  VK_BROWSER_FAVORITES: "BrowserFavorites",
  VK_BROWSER_FORWARD: "BrowserForward",
  VK_BROWSER_HOME: "BrowserHome",
  VK_BROWSER_REFRESH: "BrowserRefresh",
  VK_BROWSER_SEARCH: "BrowserSearch",
  VK_BROWSER_STOP: "BrowserStop",
  VK_ZOOM: "ZoomToggle",
}

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

  if (id in HOTKEY_LABELS) {
    return HOTKEY_LABELS[id];
  }

  // Try to find a menuitem...
  let menuitem = querySelector(`menuitem[key="${id}"][label]`);
  return menuitem ? menuitem.getAttribute("label") : id;
}

function addCustomHotKeys(hotkeys) {
  hotkeys["key_switchToNextTab"] = {
    id: "key_switchToNextTab",
    label: "Switch To Next Tab",
    modifiers: parseModifiers("meta,shift"),
    key: "]"
  };

  hotkeys["key_switchToPrevTab"] = {
    id: "key_switchToPrevTab",
    label: "Switch To Previous Tab",
    modifiers: parseModifiers("meta,shift"),
    key: "["
  };

  hotkeys["key_nextTabGroup"] = {
    id: "key_nextTabGroup",
    label: "Switch To Next Tab Group",
    modifiers: parseModifiers("control"),
    key: "`"
  };

  hotkeys["key_prevTabGroup"] = {
    id: "key_prevTabGroup",
    label: "Switch To Previous Tab Group",
    modifiers: parseModifiers("control,shift"),
    key: "`"
  };
}

function parseModifiers(attr) {
  return gModifiers.fromAttribute(attr, prefs.get("ui.key.accelKey"));
}

exports.get = function () {
  let hotkeys = {};

  for (let hotkey of querySelectorAll("key[id]")) {
    let id = hotkey.getAttribute("id");
    let data = {id: id, label: getLabel(hotkey), modifiers: 0};

    if (hotkey.hasAttribute("modifiers")) {
      data.modifiers = parseModifiers(hotkey.getAttribute("modifiers"));
    }

    if (hotkey.hasAttribute("keycode")) {
      let value = hotkey.getAttribute("keycode");
      data.key = KEY_CODE_TO_DOM_KEY_NAME[value] || null;
    } else {
      data.key = hotkey.getAttribute("key").toLowerCase();
    }

    if (data.key) {
      hotkeys[id] = data;
    }
  }

  // Add custom hotkey definitions.
  addCustomHotKeys(hotkeys);

  return hotkeys;
};
