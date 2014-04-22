/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {Ci} = require("chrome");
const winUtils = require("sdk/deprecated/window-utils");

const ID_NEXT = "key_nextTabGroup";
const ID_PREV = "key_previousTabGroup";

const LABEL_NEXT = "Switch To Next Tab Group";
const LABEL_PREV = "Switch To Previous Tab Group";

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

exports.register = function (keys) {
  let code = Ci.nsIDOMKeyEvent.DOM_VK_BACK_QUOTE;

  keys[ID_NEXT] = {
    id: ID_NEXT,
    label: LABEL_NEXT,
    modifiers: ["control"],
    code: code,
    text: "`",
    command: () => switchGroupItem(false)
  };

  keys[ID_PREV] = {
    id: ID_PREV,
    label: LABEL_PREV,
    modifiers: ["control", "shift"],
    code: code,
    text: "`",
    command: () => switchGroupItem(true)
  };
};
