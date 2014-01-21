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

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const WINDOW_TYPE = "navigator:browser";

let winUtils = require("sdk/deprecated/window-utils");
let windowIterator = winUtils.windowIterator;
let listeners = [];
let Overlays = require("core/overlay.js").Overlays;

new winUtils.WindowTracker({
    onTrack: function(window) {
        if (WINDOW_TYPE == window.document.documentElement.getAttribute("windowtype")) {

            listeners.forEach(function(listener) {
                window.addEventListener(listener.type, listener.callback, false);
            });
            Overlays._overlays && Windows.disableKeys();
        }
    },

    onUntrack: function(window) {
        if (WINDOW_TYPE == window.document.documentElement.getAttribute("windowtype")) {
            listeners.forEach(function(listener) {
                window.removeEventListener(listener.type, listener.callback, false);
            });
        }
    }
});


let Windows = {
    addEventListener: function(type, callback) {
        for (let window in windowIterator())
        window.addEventListener(type, callback, false);

        listeners.push({
            type: type,
            callback: callback
        });
    },

    removeEventListener: function(type, callback) {
        for (let window in windowIterator())
        window.removeEventListener(type, callback, false);

        listeners = listeners.filter(function(listener) {
            return !(type == listener.type && callback == listener.callback);
        });
    },

    toggleKey: function(key, state) {
        let id = "#" + key;
        for (let window in windowIterator()) {
            if (WINDOW_TYPE == window.document.documentElement.getAttribute("windowtype")) {
                let keyToToggle = window.document.documentElement.querySelector(id);
                keyToToggle.setAttribute("disabled", state);
                console.warn("DEBUG: State of key " + key + "'s disabled attribute has been set to " + keyToToggle.getAttribute("disabled"));
            }
        }
    },

    disableKeys: function() {
        let disabledOverlay = Object.keys(Overlays.overlays.disabled);

        if (disabledOverlay.length > 0) {
            let disabledSelector = "#" + disabledOverlay.join(", #");

            for (let window in windowIterator()) {
                if (WINDOW_TYPE == window.document.documentElement.getAttribute("windowtype")) {
                    let disabledKeys = window.document.documentElement.querySelectorAll(disabledSelector);

                    for (let dkey = 0; dkey < disabledKeys.length; dkey++) {
                        disabledKeys[dkey].setAttribute("disabled", "true");
                        console.warn("DEBUG: State of key " + disabledKeys[dkey].id + "'s disabled attribute has been set to " + disabledKeys[dkey].getAttribute("disabled"));

                    }
                }
            }
        }
    },

    getMostRecentWindow: function() {
        return winUtils.activeBrowserWindow;
    },
    getElementById: function(id) {
        return this.getMostRecentWindow().document.getElementById(id);
    },

    querySelector: function(sel) {
        return this.getMostRecentWindow().document.querySelector(sel);
    },

    querySelectorAll: function(sel) {
        return this.getMostRecentWindow().document.querySelectorAll(sel);
    },

    createEvent: function(type) {
        return this.getMostRecentWindow().document.createEvent(type);
    },

    createXulElement: function(tagName, attrs, parent) {
        let element = this.getMostRecentWindow().document.createElementNS(XUL_NS, tagName);

        if (attrs) {
            for (let name in attrs)
            element.setAttribute(name, attrs[name]);
        }

        if (parent) parent.appendChild(element);

        return element;
    }
};

exports.Windows = Windows;
