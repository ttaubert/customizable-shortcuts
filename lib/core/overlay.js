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

let {storage} = require("sdk/simple-storage");
let {Shortcut} = require("core/shortcut.js");
let {ColorNames} = require("prefs/colors.js");
let {serialize, unserialize} = require("util/serialization.js");

let Overlay = function(data, options) {
    this.key = data.key;
    this.shortcut = data.shortcut;

    Overlays.removeByKey(this.key);

    if (!this.key.shortcut.equals(this.shortcut) && !(this.shortcut.disabled)) {
        let overlays = Overlays.overlays;
        overlays.keys[this.key.toString()] = this;
        overlays.custom[this.shortcut.toString()] = this;
        overlays.overridden[this.key.shortcut.toString()] = this;
    }

    if (this.shortcut.disabled) {
        Overlays.overlays.disabled[this.key.toString()] = this;
    }

    if (!options || !options.dontStore) {
        Overlays.store();
    }
};

Overlay.prototype.remove = function() {
    let overlays = Overlays.overlays;
    delete overlays.keys[this.key.toString()];
    delete overlays.disabled[this.key.toString()];
    delete overlays.custom[this.shortcut.toString()];
    delete overlays.overridden[this.key.shortcut.toString()];
    Overlays.store();
};

let Overlays = {
    _overlays: null,

    _load: function() {
        this._overlays = {
            keys: {},
            custom: {},
            overridden: {},
            conflicting: {},
            disabled: {}
        };
        (storage.overlays || []).forEach(unserialize);
        Overlays.getDuplicates();
        require("util/windows.js").Windows.disableKeys();
        return this._overlays;
    },

    store: function() {
        storage.overlays = [];
        for (let key in this.overlays.keys)
        storage.overlays.push(serialize(this.overlays.keys[key]));
        for (let key in this.overlays.disabled)
        storage.overlays.push(serialize(this.overlays.disabled[key]));
    },

    get overlays() {
        return this._overlays || this._load();
    },

    findByKey: function(key) {
        let idx = key.toString();
        if (idx in this.overlays.keys) return this.overlays.keys[idx];
    },

    findByDisabledKey: function(key) {
        let idx = key.toString();
        if (idx in this.overlays.disabled) return this.overlays.disabled[idx];
    },

    findByCustomShortcut: function(shortcut) {
        let idx = shortcut.toString();
        if (idx in this.overlays.custom) return this.overlays.custom[idx];

    },

    findByOverriddenShortcut: function(shortcut) {
        let idx = shortcut.toString();
        if (idx in this.overlays.overridden) return this.overlays.overridden[idx];
    },

    findByConflictingShortcut: function(shortcut) {
        let idx = shortcut.toString();
        if (idx in this.overlays.conflicting) return this.overlays.conflicting[idx];
    },

    getConflictingShortcutColor: function(shortcut) {
        let idx = shortcut.toString();
        let groupColor = this.overlays.conflicting[idx][this.overlays.conflicting[idx].length - 1].groupColor;
        if (typeof(groupColor) != "undefined") return groupColor;
    },

    removeByKey: function(key) {
        let overlay = (this.findByKey(key) || this.findByDisabledKey(key));
        overlay && overlay.remove();
        this.getDuplicates();
    },
    getDuplicates: function() {
        if (!shortcutKeys) var shortcutKeys = {};
        let overlays = Overlays.overlays;

        for (let iterate in overlays.keys) {
            let currKey = overlays.keys[iterate];

            if (currKey.hasOwnProperty("shortcut") && !(currKey.key.disable)) {
                let currShort = currKey.shortcut.toString();
                if (!shortcutKeys[currShort]) shortcutKeys[currShort] = [];

                shortcutKeys[currShort].push(iterate);
                var filteredShortcutKeys = {};

                for (let i in shortcutKeys) {
                    if (shortcutKeys[i].length > 1) {
                        filteredShortcutKeys[i] = shortcutKeys[i]; // Add Shortcut to final array only if multiple mappings found.
                    }
                }

            }

        }
        for (let i in filteredShortcutKeys) {
            if (!usedColors) var usedColors = [];
            if (typeof(overlays.conflicting[i]) != "undefined") {
                let prevColor = overlays.conflicting[i][overlays.conflicting[i].length - 1].groupColor;
                if (typeof(prevColor) != "undefined") { // If already assigned, use previous color to avoid confusion.
                    groupColor = overlays.conflicting[i][overlays.conflicting[i].length - 1].groupColor;
                    usedColors.push(groupColor);
                }
            } else {
                do {
                    var groupColor = ColorNames.getRandom(); // Get random color to identify conflicting shortcuts.
                    usedColors.push(groupColor);
                }
                while (groupColor in usedColors); // Make sure colors do not repeat between different groups of key mappings. 
            }
            filteredShortcutKeys[i].push({
                "groupColor": groupColor
            });
        }

        overlays.conflicting = filteredShortcutKeys;
    }
};

exports.Overlay = Overlay;
exports.Overlays = Overlays;
