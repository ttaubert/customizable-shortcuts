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

let Groups = {
    groups: {
        "Navigation": ["goBackKb", "goBackKb2", "goForwardKb", "goForwardKb2", "goHome", "openFileKb", "key_reload", "key_reload2", "key_forceReload", /*"Ctrl+F5", Ctrl+Shift+R,*/ "key_stop", "key_stop_mac", "focusURLBar", "focusURLBar2"],

        "Current Page": [ /*"End", "F6", "Shift+F6",*/ "goHome", "key_viewInfo", "key_viewSource", "printKb", "key_savePage", "key_fullZoomEnlarge", "key_fullZoomReduce", "key_fullZoomReset", "key_fullScreen", "key_fullScreen_old", "key_minimizeWindow"],

        "Editing": ["key_copy", "key_cut", "key_delete", "key_paste", "key_redo", "key_selectAll", "key_undo"],

        "Search": ["key_find", "key_findAgain", "key_findPrevious", "key_search", "key_search2"],

        "Windows & Tabs": ["key_close", "key_closeWindow", "key_closeOther", "key_newNavigatorTab", "key_newNavigator", "key_undoCloseTab", "key_undoCloseWindow", "key_selectTab1", "key_selectTab2", "key_selectTab3", "key_selectTab4", "key_selectTab5", "key_selectTab6", "key_selectTab7", "key_selectTab8", "key_selectLastTab", "key_tabview", "key_nextTabGroup", "key_previousTabGroup", "key_prevTab", "key_nextTab"],

        "History": ["key_gotoHistory", "showAllHistoryKb"],

        "Bookmarks": ["addBookmarkAsKb", "viewBookmarksSidebarKb", "viewBookmarksSidebarWinKb", "manBookmarkKb", "bookmarkAllTabsKb"],

        "Tools": ["key_openDownloads", "key_openAddons", "key_errorConsole", "key_webConsole", "key_privatebrowsing", "key_sanitize", "key_sanitize_mac"]
    },

    groupKeys: function(keys) {
        let map = {};
        keys.forEach(function(key) map[key.id] = key);

        let groups = [];
        for (let name in this.groups) {
            group = this.groups[name].map(function(id) {
                if (id in map) {
                    let key = map[id];
                    delete map[id];
                    return key;
                }
            }).filter(function(key) key);

            if (group.length) groups[name] = group;
        }

        if (Object.keys(map).length) {
            let group = groups["Other"] = [];
            for (let id in map)
            group.push(map[id]);
        }

        return groups;
    }
}

exports.Groups = Groups;
