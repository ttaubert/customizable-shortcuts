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

const {Ci} = require("chrome");
let {modifierKeys, Modifiers} = require("core/modifiers");

let Shortcut = function (data) {
  this.key = data.key;
  this.keycode = data.keycode;
  this.modifiers = data.modifiers;
}

Shortcut.prototype.equals = function (obj) {
  if (obj instanceof Shortcut) {
    return obj.toString() == this.toString();
  }

  return false;
}

Shortcut.prototype.toString = function () {
  if (this._toStringCache)
    return this._toStringCache;

  let parts = [];

  if (this.modifiers)
    parts.push(this.modifiers.toString() + "+");

  if (this.key)
    parts.push(String.fromCharCode(this.key));

  if (this.keycode) {
    let keyName = this.keycode.replace(/^VK_/, "");
    keyName = keyName[0] + keyName.substr(1).toLowerCase();
    keyName = keyName.replace(/_[a-z]/i, function (str) str[1].toUpperCase());
    parts.push(keyName);
  }

  return this._toStringCache = parts.join("");
}

Shortcut.prototype.isComplete = function () {
  return !!(this.key || this.keycode);
}

Shortcut.fromEvent = function (event) {
  let data = {modifiers: Modifiers.fromEvent(event)};

  let keys = Ci.nsIDOMKeyEvent;
  for (let name in keys) {
    let key = keys[name];
    if (!(key in modifierKeys) && event.keyCode == key) {
      data.keycode = name.replace(/^DOM_/, "");
      break;
    }
  }

  return new Shortcut(data);
}

exports.Shortcut = Shortcut;
