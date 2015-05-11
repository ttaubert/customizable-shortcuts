/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const winUtils = require("sdk/deprecated/window-utils");

const COMMANDS_CUSTOM = new Map([
  ["key_switchToNextTab", () => advanceSelectedTab(false)],
  ["key_switchToPrevTab", () => advanceSelectedTab(true)],

  ["key_nextTabGroup", () => switchGroupItem(false)],
  ["key_prevTabGroup", () => switchGroupItem(true)],
]);

function advanceSelectedTab(reverse) {
  let window = winUtils.activeBrowserWindow;
  let gBrowser = window.gBrowser;
  let offset = reverse ? 1 : -1;

  if (window.getComputedStyle(gBrowser, null).direction == "ltr") {
    offset *= -1;
  }

  gBrowser.tabContainer.advanceSelectedTab(offset, true);
}

function switchGroupItem(reverse) {
  let {gBrowser, TabView} = winUtils.activeBrowserWindow;
  let numHiddenTabs = gBrowser.tabs.length - gBrowser.visibleTabs.length;

  if (!TabView || TabView.isVisible() || !numHiddenTabs) {
    return;
  }

  TabView._initFrame(function () {
    let groupItems = TabView._window.GroupItems;
    let tabItem = groupItems.getNextGroupItemTab(reverse);
    if (!tabItem) {
      return;
    }

    // Switch to the new tab, and close the old group if it's now empty.
    let oldGroupItem = groupItems.getActiveGroupItem();
    gBrowser.selectedTab = tabItem.tab;
    oldGroupItem.closeIfEmpty();
  });
}

function executeXULCommand(elem) {
  let cmdID = elem.getAttribute("command");
  let command = elem.ownerDocument.getElementById(cmdID);

  if (command) {
    command.doCommand();
  }
}

function fireXULCommandEvent(elem) {
  let sourceEvent = elem.ownerDocument.createEvent("Events");
  sourceEvent.initEvent("command", false, false);

  let event = elem.ownerDocument.createEvent("XULCommandEvents");
  event.initCommandEvent("command", true, false, null, null, false, false, false, false, sourceEvent);
  elem.dispatchEvent(event);
}

exports.execute = function (id) {
  // Handle custom commands.
  if (COMMANDS_CUSTOM.has(id)) {
    COMMANDS_CUSTOM.get(id)();
    return;
  }

  let doc = winUtils.activeBrowserWindow.document;
  let key = doc.getElementById(id);
  if (!key) {
    return;
  }

  if (key.hasAttribute("command")) {
    executeXULCommand(key);
    return;
  }

  if (key.hasAttribute("oncommand")) {
    fireXULCommandEvent(key);
    return;
  }

  let menuitem = doc.querySelector("menuitem[key=" + id + "][command]");
  if (menuitem) {
    executeXULCommand(menuitem);
  }
};
