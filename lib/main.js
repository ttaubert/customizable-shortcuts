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
const {Cc,Ci} = require("chrome");

let {Windows} = require("util/windows.js");
let {Overlays} = require("core/overlay.js");
let {Shortcut} = require("core/shortcut.js");
let {Preferences} = require("util/preferences.js");

require("prefs/prefpane.js");
require("patch/bug-645371.js");
require("patch/bug-78414.js");

if (require("util/os.js").checkOSID() == "Darwin") // Add "Next/Previous Tab" to the Keyset. We'll be adding the menu items along with the one for our extension.
require("patch/bug-406199.js");

let onKeyDown = function(event) {
    let shortcut = Shortcut.fromEvent(event);

    // check if this is a custom shortcut
    let overlay = Overlays.findByCustomShortcut(shortcut);

    if (overlay) overlay.key.executeCommand();
    else // check if this is a shortcut that is overriden by a custom one
    overlay = Overlays.findByOverriddenShortcut(shortcut);

    if (overlay) {
        event.preventDefault();
        event.stopPropagation();
    }
};

exports.main = function(options, callbacks) {
    Windows.addEventListener("keydown", onKeyDown);
};

exports.onUnload = function(reason) {
    Windows.removeEventListener("keydown", onKeyDown);
    Preferences.uninit();
};
