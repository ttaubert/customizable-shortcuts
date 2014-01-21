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
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

let {Windows} = require("util/windows.js");
let {Shortcut} = require("core/shortcut.js");
let {Modifiers} = require("core/modifiers.js");

function Key(data) {
    let {Windows} = require("util/windows.js");
    let element = Windows.getElementById(data.id);
    this.id = data.id;
    this.element = element;

    this.key = element.getAttribute("key").toUpperCase().charCodeAt(0);
    this.keycode = element.getAttribute("keycode");
    if (element.hasAttribute("modifiers")) this.modifiers = new Modifiers({
        modifiers: element.getAttribute("modifiers").split(/[,\s]/)
    });

    this.shortcut = new Shortcut({
        key: this.key,
        keycode: this.keycode,
        modifiers: this.modifiers
    });
}

Key.prototype = {
    executeCommand: function Key_executeCommand() {
        if (this.element.hasAttribute("command")) {
            let {                Windows
            } = require("util/windows.js");
            let command = this.element.getAttribute("command");
            command = Windows.getElementById(command);
            command && command.doCommand();
            return;
        }

        if (this.element.hasAttribute("oncommand")) {
            let sourceEvent = Windows.createEvent("Events");
            sourceEvent.initEvent("command", false, false);
            let event = Windows.createEvent("XULCommandEvents");
            event.initCommandEvent("command", true, false, null, null, false, false, false, false, sourceEvent);
            this.element.dispatchEvent(event);
        }
    },

    getLabel: function Key_getLabel() {
        return this.element.getAttribute("label");
    },

    toString: function Key_toString() {
        return this.id;
    }
};

let Keys = {
    _keys: null,

    _loadKeys: function() {
        let {Windows} = require("util/windows.js");
        this._keys = {};
        let children = Windows.querySelectorAll("key");

        for (let c = 0; c < children.length; c++) {
            let key = children[c];
            var element = key;
            if (key.getAttribute("command") == "Browser:Reload" && !key.getAttribute("id")) key.setAttribute("id", "key_reload2"); // Fix Reload Key without an ID.
            if (key.getAttribute("command") == "Browser:ReloadSkipCache" && !key.getAttribute("id")) key.setAttribute("id", "key_forceReload"); // Fix ReloadSkipCache Key without an ID.
            if (key.hasAttribute("id")) {
                let id = key.getAttribute("id");
                this._keys[id] = new Key({
                    id: id
                });

            }
            //       else {  // The other ID-less keys are basically just redundant. Leaving this debug bit in case somebody wants to use them, though.
            //       const {Cc,Ci} = require("chrome");
            //         var XMLSerializer = Cc["@mozilla.org/xmlextras/xmlserializer;1"].
            //         	       createInstance(Ci.nsIDOMSerializer); 
            // 		let noidElement = key;
            // 		console.info("DEBUG:		Found key without ID: "+XMLSerializer.serializeToString(noidElement));
            // 
            //       
            //       }
        }
        return this._keys;
    },

    get keys() {
        return this._keys || this._loadKeys();
    }

};

exports.Key = Key;
exports.Keys = Keys;
