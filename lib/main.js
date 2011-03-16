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

let Key = require("keys").Key;
let Shortcut = require("shortcuts").Shortcut;
let browserWindows = require("browser-windows");

// TODO later: read from config
let shortcuts = [
  new Shortcut(new Key("key_tabview"), ["accel"], 32),
  new Shortcut(new Key("key_viewSource"), ["accel", "shift"], 69)
];

let onKeyDown = function (event) {
  let keys = [];

  // check if this is a custom shortcut
  let isCustom = shortcuts.some(function (shortcut) {
    let key = shortcut.getKey();

    if (shortcut.equalsEvent(event)) {
      key.executeCommand();
      return true;
    }

    keys.push(key);
    return false;
  });

  // check if this is a shortcut that is overriden by a custom one
  let isOverridden = !isCustom && keys.some(function (key) {
    return key.equalsEvent(event);
  });

  if (isCustom || isOverridden) {
    event.preventDefault();
    event.stopPropagation();
  }
}

exports.main = function (options, callbacks) {
  browserWindows.addEventListener("keydown", onKeyDown);
};

exports.onUnload = function (reason) {
  browserWindows.removeEventListener("keydown", onKeyDown);
};
