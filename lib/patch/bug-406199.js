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
 
var {
    Windows
} = require("util/windows.js");
var mainCommandSet = Windows.getElementById("mainCommandSet");
var mainKeyset = Windows.getElementById("mainKeyset");
var _ = require("sdk/l10n").get;

if (!Windows.getElementById("Browser:NextTab")) var cmd1 = Windows.createXulElement("command", { // <command id="Browser:NextTab" oncommand="gBrowser.tabContainer.advanceSelectedTab(1, true);"/>
    "id": "Browser:NextTab",
    "oncommand": "gBrowser.tabContainer.advanceSelectedTab(1, true);"
}, mainCommandSet);

if (!Windows.getElementById("Browser:PrevTab")) var cmd2 = Windows.createXulElement("command", { // <command id="Browser:PrevTab" oncommand="gBrowser.tabContainer.advanceSelectedTab(-1, true);"/>
    "id": "Browser:PrevTab",
    "oncommand": "gBrowser.tabContainer.advanceSelectedTab(-1, true);"
}, mainCommandSet);

if (!Windows.getElementById("Browser:CloseOtherTabs")) var cmd3 = Windows.createXulElement("command", { // <command id="Browser:CloseOtherTabs" oncommand="gBrowser.removeAllTabsBut(gBrowser.mCurrentTab);"/>
    "id": "Browser:CloseOtherTabs",
    "oncommand": "gBrowser.removeAllTabsBut(gBrowser.mCurrentTab);"
}, mainCommandSet);

if (!Windows.getElementById("key_nextTab")) var key1 = Windows.createXulElement("key", { // <key id="key_nextTab" keycode="VK_TAB" command="Browser:NextTab" modifiers="accel"/>
    "id": "key_nextTab",
    "keycode": "VK_TAB",
    "command": "Browser:NextTab",
    "modifiers": "control"
}, mainKeyset);

if (!Windows.getElementById("key_prevTab")) var key2 = Windows.createXulElement("key", { // <key id="key_prevTab" keycode="VK_TAB" command="Browser:PrevTab" modifiers="accel,shift"/>
    "id": "key_prevTab",
    "keycode": "VK_TAB",
    "command": "Browser:PrevTab",
    "modifiers": "control,shift"
}, mainKeyset);

if (!Windows.getElementById("key_closeOther")) var key3 = Windows.createXulElement("key", { // <key id="key_closeOther" key="W" command="Browser:CloseOtherTabs" modifiers="control,alt"/>
    "id": "key_closeOther",
    "key": _("closeCmd_key"),
    "command": "Browser:CloseOtherTabs",
    "modifiers": "control,alt"
}, mainKeyset);
