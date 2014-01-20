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

 

let {
    Windows
} = require("util/windows.js");
var _ = require("sdk/l10n").get;

let Actions = {
    _labels: {
        "focusURLBar": _("focusURLBar_label"),
        "focusURLBar2": _("focusURLBar2_label"),
        "key_search": _("key_search_label"),
        "key_search2": _("key_search2_label"),
        "key_stop": _("key_stop_label"),
        "key_stop_mac": _("key_stop_mac_label"),
        "key_reload": _("key_reload_label"),
        "key_reload2": _("key_reload2_label"),
        "key_forceReload": _("key_forceReload_label"),
        "key_forceReload2": _("key_forceReload2_label"),
        "goHome": _("goHome_label"),
        "goBackKb": _("goBackKb_label"),
        "goBackKb2": _("goBackKb2_label"),
        "goForwardKb": _("goForwardKb_label"),
        "goForwardKb2": _("goForwardKb2_label"),
        "key_close": _("key_close_label"),
        "key_undoCloseTab": _("key_undoCloseTab_label"),
        "key_undoCloseWindow": _("key_undoCloseWindow_label"),
        "key_toggleAddonBar": _("key_toggleAddonBar_label"),
        "key_findPrevious": _("key_findPrevious_label"),
        "key_selectLastTab": _("key_selectLastTab_label"),
        "key_closeOther": _("key_closeOther_label"),
        "key_prevTab": _("key_prevTab_label"),
        "key_nextTab": _("key_nextTab_label"),
        "key_selectTab1": _("key_selectTab1_label"),
        "key_selectTab2": _("key_selectTab2_label"),
        "key_selectTab3": _("key_selectTab3_label"),
        "key_selectTab4": _("key_selectTab4_label"),
        "key_selectTab5": _("key_selectTab5_label"),
        "key_selectTab6": _("key_selectTab6_label"),
        "key_selectTab7": _("key_selectTab7_label"),
        "key_selectTab8": _("key_selectTab8_label"),
        "key_tabview": _("key_tabview_label"),
        "key_nextTabGroup": _("key_nextTabGroup_label"),
        "key_previousTabGroup": _("key_previousTabGroup_label"),
        "key_sanitize_mac": _("key_sanitize_mac_label"),
        "key_devToolboxMenuItemF12": _("key_devToolboxMenuItemF12_label"),
        "key_devToolboxMenuItem": _("key_devToolboxMenuItem_label"),
        "key_fullScreen_old": _("key_fullScreen_old_label"),
        "key_minimizeWindow": _("key_minimizeWindow_label"),

        "key_firebug_toggleBreakOn": _("key_firebug_toggleBreakOn_label"),
        "key_firebug_detachFirebug": _("key_firebug_detachFirebug_label"),
        "key_firebug_closeFirebug": _("key_firebug_closeFirebug_label"),
        "key_firebug_focusCommandLine": _("key_firebug_focusCommandLine_label"),
        "key_firebug_toggleInspecting": _("key_firebug_toggleInspecting_label"),
        "key_foxyproxyquickadd": _("key_foxyproxyquickadd_label"),
        "key_changeproxy": _("key_changeproxy_label"),
        "secureLoginShortcut": _("secureLoginShortcut_label")
    },

    get menuItems() {
        if (!this._menuItems) this._loadMenuItems();

        return this._menuItems;
    },

    findByKey: function(key) {
        let label = key.getLabel();

        if (label) return label;

        let id = key.id;

        if (id in this._labels) return this._labels[id];

        // try to find a menuitem
        let menuitem = Windows.querySelector("menuitem[key=" + id + "]");
        if (menuitem && menuitem.hasAttribute("label")) return menuitem.getAttribute("label");

        return id;
    }
}

exports.Actions = Actions;
