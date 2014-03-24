/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

exports.applyPatch = function (window) {
  let {gBrowser, TabView, document} = window;

  if (document.getElementById("key_nextTabGroup")) {
    return;
  }

  let mainCommandSet = document.getElementById("mainCommandSet");
  let mainKeyset = document.getElementById("mainKeyset");

  // <command id="Browser:NextTabGroup" oncommand="TabView.switchToNextGroup();"/>
  let cmd1 = createXulElement("command", {
    "id": "Browser:NextTabGroup",
    "oncommand": "TabView.switchToNextGroup();"
  }, mainCommandSet);

  // <command id="Browser:PreviousTabGroup" oncommand="TabView.switchToPreviousGroup();"/>
  let cmd2 = createXulElement("command", {
    "id": "Browser:PreviousTabGroup",
    "oncommand": "TabView.switchToPreviousGroup();"
  }, mainCommandSet);

  // <key id="key_nextTabGroup" key="&switchTabGroup.commandkey;" command="Browser:NextTabGroup" modifiers="accel"/>
  let key1 = createXulElement("key", {
    "id": "key_nextTabGroup",
    "key": "`",
    "command": "Browser:NextTabGroup",
    "modifiers": "accel"
  }, mainKeyset);

  // <key id="key_previousTabGroup" key="&switchTabGroup.commandkey;" command="Browser:PreviousTabGroup" modifiers="accel,shift"/>
  let key2 = createXulElement("key", {
    "id": "key_previousTabGroup",
    "key": "`",
    "command": "Browser:PreviousTabGroup",
    "modifiers": "accel,shift"
  }, mainKeyset);

  TabView.switchToNextGroup = () => switchGroupItem(false);
  TabView.switchToPreviousGroup = () => switchGroupItem(true);

  function createXulElement(tagName, attrs, parent) {
    let element = document.createElementNS(XUL_NS, tagName);

    if (attrs) {
      for (let name of Object.keys(attrs)) {
        element.setAttribute(name, attrs[name]);
      }
    }

    if (parent) {
      parent.appendChild(element);
    }

    return element;
  }

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
};
