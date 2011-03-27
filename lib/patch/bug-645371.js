/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is
 * Tim Taubert <tim@timtaubert.de>
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

let {getElementById, createXulElement, getMostRecentWindow} = require("util/browser-windows");

let mainCommandSet = getElementById("mainCommandSet");
let mainKeyset = getElementById("mainKeyset");

// <command id="Browser:NextTabGroup" oncommand="TabView.switchToNextGroup();"/>
let cmd1 = createXulElement("command");
cmd1.setAttribute("id", "Browser:NextTabGroup");
cmd1.setAttribute("oncommand", "TabView.switchToNextGroup();");
mainCommandSet.appendChild(cmd1);

// <command id="Browser:PreviousTabGroup" oncommand="TabView.switchToPreviousGroup();"/>
let cmd2 = createXulElement("command");
cmd2.setAttribute("id", "Browser:PreviousTabGroup");
cmd2.setAttribute("oncommand", "TabView.switchToPreviousGroup();");
mainCommandSet.appendChild(cmd2);

// <key id="key_nextTabGroup" key="&switchTabGroup.commandkey;" command="Browser:NextTabGroup" modifiers="accel"/>
let key1 = createXulElement("key");
key1.setAttribute("id", "key_nextTabGroup");
key1.setAttribute("key", "`");
key1.setAttribute("command", "Browser:NextTabGroup");
key1.setAttribute("modifiers", "accel");
mainKeyset.appendChild(key1);

// <key id="key_previousTabGroup" key="&switchTabGroup.commandkey;" command="Browser:PreviousTabGroup" modifiers="accel,shift"/>
let key2 = createXulElement("key");
key2.setAttribute("id", "key_previousTabGroup");
key2.setAttribute("key", "`");
key2.setAttribute("command", "Browser:PreviousTabGroup");
key2.setAttribute("modifiers", "accel,shift");
mainKeyset.appendChild(key2);

let window = getMostRecentWindow();
let TabView = window.TabView;
let gBrowser = window.gBrowser;

TabView.switchToNextGroup = function () {
  switchGroupItem(false);
}

TabView.switchToPreviousGroup = function () {
  switchGroupItem(true);
}

let switchGroupItem = function (reverse) {
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
