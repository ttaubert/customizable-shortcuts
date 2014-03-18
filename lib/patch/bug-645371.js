/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {Windows} = require("util/windows");

function switchGroupItem(reverse) {
  let numHiddenTabs = gBrowser.tabs.length - gBrowser.visibleTabs.length;
  if (TabView.isVisible() || !numHiddenTabs)
    return;

  TabView._initFrame(function () {
    let groupItems = TabView._window.GroupItems;
    let tabItem = groupItems.getNextGroupItemTab(reverse);
    if (!tabItem)
      return;

    // Switch to the new tab, and close the old group if it's now empty.
    let oldGroupItem = groupItems.getActiveGroupItem();
    gBrowser.selectedTab = tabItem.tab;
    oldGroupItem.closeIfEmpty();
  });
}

if (!Windows.getElementById("key_nextTabGroup")) {
  let mainCommandSet = Windows.getElementById("mainCommandSet");
  let mainKeyset = Windows.getElementById("mainKeyset");

  // <command id="Browser:NextTabGroup" oncommand="TabView.switchToNextGroup();"/>
  let cmd1 = Windows.createXulElement("command", {
    "id": "Browser:NextTabGroup",
    "oncommand": "TabView.switchToNextGroup();"
  }, mainCommandSet);

  // <command id="Browser:PreviousTabGroup" oncommand="TabView.switchToPreviousGroup();"/>
  let cmd2 = Windows.createXulElement("command", {
    "id": "Browser:PreviousTabGroup",
    "oncommand": "TabView.switchToPreviousGroup();"
  }, mainCommandSet);

  // <key id="key_nextTabGroup" key="&switchTabGroup.commandkey;" command="Browser:NextTabGroup" modifiers="accel"/>
  let key1 = Windows.createXulElement("key", {
    "id": "key_nextTabGroup",
    "key": "`",
    "command": "Browser:NextTabGroup",
    "modifiers": "accel"
  }, mainKeyset);

  // <key id="key_previousTabGroup" key="&switchTabGroup.commandkey;" command="Browser:PreviousTabGroup" modifiers="accel,shift"/>
  let key2 = Windows.createXulElement("key", {
    "id": "key_previousTabGroup",
    "key": "`",
    "command": "Browser:PreviousTabGroup",
    "modifiers": "accel,shift"
  }, mainKeyset);

  let window = Windows.getMostRecentWindow();
  let TabView = window.TabView;
  let gBrowser = window.gBrowser;

  TabView.switchToNextGroup = function () {
    switchGroupItem(false);
  };

  TabView.switchToPreviousGroup = function () {
    switchGroupItem(true);
  };
}
