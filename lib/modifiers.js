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

const {Cc, Ci} = require("chrome");

let accelKeyNames = {17: "control", 18: "alt", 224: "meta"};
let modifierNames = {control: "Ctrl", meta: "Meta", shift: "Shift", alt: "Alt"};

// TODO watch pref changes
let prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
let accelKey = prefs.getBranch("ui.key.").getIntPref("accelKey");

let getAccelKeyName = function () {
  return accelKeyNames[accelKey] || "control";
}

let isAccelKeyPressed = function (event) {
  let accelKeyName = getAccelKeyName().replace("control", "ctrl");
  return event[accelKeyName + "Key"];
}

let Modifiers = function (modifiers) {
  this.modifiers = modifiers;
}

Modifiers.prototype.toString = function () {
  let keys = {};
  this.modifiers.forEach(function (modifier) {
    keys[modifier.toLowerCase()] = 1;
  });

  if (keys.accel)
    keys[getAccelKeyName()] = 1;

  let names = [];
  for (var name in modifierNames) {
    if (keys[name])
      names.push(modifierNames[name]);
  }

  return names.join("+");
}

Modifiers.prototype.equals = function (obj) {
  if (obj.stopPropagation) {
    let eventModifiers = {
      "control": obj.ctrlKey,
      "accel": isAccelKeyPressed(obj),
      "shift": obj.shiftKey,
      "meta": obj.metaKey,
      "alt": obj.altKey
    };

    return this.modifiers.every(function (mod) eventModifiers[mod.toLowerCase()]);
  }

  return false;
}

exports.Modifiers = Modifiers;
