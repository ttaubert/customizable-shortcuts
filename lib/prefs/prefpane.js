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
let {Windows} = require("util/windows.js");  
let {Keys} = require("core/key.js");
let {TreeView} = require("prefs/treeview.js");
let {Overlay, Overlays} = require("core/overlay.js");
let {PreferenceTree} = require("prefs/tree.js");

const {
    Cc, Ci
} = require("chrome");
var _ = require("sdk/l10n").get;
const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

let MenuItem = function(window, kind) {
    this.window = window;
    if ("tabSwitching" == kind) {
        let parentmenu = this.window.document.getElementById("windowPopup");

        let windowsep = this.window.document.getElementById("sep-window-list");
        this.separator = this._createElement("menuseparator");
        parentmenu.insertBefore(this.separator, windowsep);
        this.separator.setAttribute("id", "sep-switch-tabs");

        this.prevtab = this._createElement("menuitem");
        parentmenu.insertBefore(this.prevtab, this.separator.nextSibling);
        this.prevtab.setAttribute("command", "Browser:PrevTab");
        this.prevtab.setAttribute("label", _("previousTab_label"));

        this.nexttab = this._createElement("menuitem");
        parentmenu.insertBefore(this.nexttab, this.prevtab.nextSibling);
        this.nexttab.setAttribute("command", "Browser:NextTab");
        this.nexttab.setAttribute("label", _("nextTab_label"));
    } else {
        let self = this;
        this.element = this._createElement("menuitem");
        this.element.setAttribute("id", "ttshortcutsMenuItem");
        this.element.setAttribute("class", "menu-iconic");
        this.element.setAttribute("image", require("sdk/self").data.url("icon32.png"));
        this.element.setAttribute("label", _("MenuItem_label"));
        this.element.setAttribute("insertBefore", "sanitizeSeparator");
        this.element.setAttribute("oncommand", "window.openDialog('chrome://customizable-shortcuts/content/ttShortcuts_preferences.xul','Customizable Shortcuts','chrome,titlebar=yes,close=no,toolbar=no,centerscreen,dialog=yes')");
        let parentmenu = this.window.document.getElementById("menu_ToolsPopup");
        parentmenu.appendChild(this.element);

    }
}

MenuItem.prototype = {
    _built: false,

    _createStylesheet: function(href) {
        let doc = this.window.document;
        let style = doc.createProcessingInstruction("xml-stylesheet", 'href="' + href + '"');
        doc.insertBefore(style, doc.querySelector("window"));
    },

    _createElement: function(tag, parent) {
        let element = this.window.document.createElementNS(XUL_NS, tag);
        parent && parent.appendChild(element);
        return element;
    },

    _build: function() {
        return;
    },
};

function warnforConflicting() {
    let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].
    getService(Ci.nsIPromptService);
    prompts.alert(window, _("conflictWarning.title"), _("conflictWarning.text"));
}

let preferenceDialogInit = function(window) {
    let self = this;
    this.window = window;
    this.filter = this.window.document.getElementById("ttCustomizableShortcuts_Filter");
    this.resetButton = this.window.document.getElementById("ttCustomizableShortcuts_Reset");
    this.editButton = this.window.document.getElementById("ttCustomizableShortcuts_Edit");
    this.disableButton = this.window.document.getElementById("ttCustomizableShortcuts_Disable");
    this.acceptButton = this.window.document.getElementById("ttCustomizableShortcuts_Accept");

    let tree = new PreferenceTree(this.window);
    this.treeElement = tree.toElement();
    this.window.setTimeout(function() self.treeElement.view = new TreeView(), 0);

    this.acceptButton.addEventListener("command", function() {
        var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
        if ("undefined" != typeof(Overlays.overlays.conflicting)) {
            let checkForConflicting = Object.keys(Overlays.overlays.conflicting).length;
            if (checkForConflicting >= 1) warnforConflicting();
            else windowMediator.getMostRecentWindow("CustomizableShortcuts:config").window.close();
        } else windowMediator.getMostRecentWindow("CustomizableShortcuts:config").window.close();
    }, false);

    this.resetButton.addEventListener("command", function() {
        let row = self.treeElement.currentIndex;
        let column = self.treeElement.columns.getLastColumn();
        let id = self.treeElement.view.getCellValue(row, column);
        let key = Keys.keys[id];
        Overlays.removeByKey(key);
        self.resetButton.setAttribute("disabled", true);
        self.treeElement.treeBoxObject.invalidateRow(row);
    }, false);

    this.editButton.addEventListener("command", function() {
        console.warn("DEBUG:   Window: " + Windows.getMostRecentWindow().document.documentElement.getAttribute("id"));
        let row = self.treeElement.currentIndex;
        let column = self.treeElement.columns.getLastColumn();
        self.treeElement.startEditing(row, column);
    }, false);

    this.disableButton.addEventListener("command", function() {
        let row = self.treeElement.currentIndex;
        let column = self.treeElement.columns.getLastColumn();
        let id = self.treeElement.view.getCellValue(row, column);
        let key = Keys.keys[id];
        if (!Overlays.findByDisabledKey(key)) {
            new Overlay({
                key: key,
                shortcut: {
                    disabled: true
                }
            });
            self.disableButton.label = _("disableButton_true");
            console.info("DEBUG:		Overlay: " + JSON.stringify(Overlays.findByDisabledKey(key), null, 4));
            self.treeElement.treeBoxObject.invalidateRow(row);
        } else {
            Overlays.removeByKey(key);
            self.disableButton.label = _("disableButton_false");
            console.info("DEBUG:		Overlay: " + JSON.stringify(Overlays.findByDisabledKey(key), null, 4));
            self.treeElement.treeBoxObject.invalidateRow(row);
        }

        let isDisabled = ( !! Overlays.findByDisabledKey(key)).toString();
        console.warn("DEBUG:  isDisabled's value is: " + isDisabled + ", and its type is: " + typeof(isDisabled));
        Windows.toggleKey(key, isDisabled);
    }, false);

    this.filter.addEventListener("command", function() {
        self.treeElement.view = new TreeView(self.filter.value);
    }, false);
}

let delegate = {
    onTrack: function(window) {
        if ("main-window" == window.document.documentElement.getAttribute("id")) {
            if (!require("sdk/private-browsing").isPrivate(window)) // Do not allow access to preferences in Private Windows.
            new MenuItem(window);

            if ("Darwin" == require("util/os.js").checkOSID()) new MenuItem(window, "tabSwitching"); // Bug 406199: Add "Next/Previous Tab" items to the "Window Menu" if on Mac.
        } else if ("ttShortcutsPrefsDialog" == window.document.documentElement.getAttribute("id")) {
            preferenceDialogInit(window);
        }
    },
    onUntrack: function() {}
};

let winUtils = require("sdk/deprecated/window-utils");
let windowTracker = new winUtils.WindowTracker(delegate);
