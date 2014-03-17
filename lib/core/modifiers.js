/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let {Preferences} = require("util/preferences");

let modifierKeys = {16: "shift", 17: "control", 18: "alt", 224: "meta"};
let modifierNames = {control: "Ctrl", meta: "Meta", shift: "Shift", alt: "Alt"};

let getAccelKeyName = function () {
  return modifierKeys[Preferences.getIntPref("ui.key.", "accelKey")] || "control";
}

let isAccelKeyPressed = function (event) {
  let accelKeyName = getAccelKeyName().replace("control", "ctrl");
  return event[accelKeyName + "Key"];
}

let Modifiers = function (data) {
  this.modifiers = data.modifiers;
}

Modifiers.prototype.toString = function () {
  let keys = {};
  this.modifiers.forEach(function (modifier) {
    keys[modifier.toLowerCase()] = 1;
  });

  if (keys.accel)
    keys[getAccelKeyName()] = 1;

  let names = [];
  for (let name in modifierNames) {
    if (keys[name])
      names.push(modifierNames[name]);
  }

  return names.join("+");
}

Modifiers.fromEvent = function (event) {
  let modifiers = [];

  if (event.ctrlKey)
    modifiers.push("control");
  if (event.shiftKey)
    modifiers.push("shift");
  if (event.metaKey)
    modifiers.push("meta");
  if (event.altKey)
    modifiers.push("alt");

  if (event.keyCode in modifierKeys) {
    let key = modifierKeys[event.keyCode];
    if (-1 == modifiers.indexOf(key))
      modifiers.push(key);
  }

  if (modifiers.length)
    return new Modifiers({modifiers: modifiers});
}

Modifiers.isModifier = function (key) {
  return key in modifierKeys;
}

exports.Modifiers = Modifiers;
