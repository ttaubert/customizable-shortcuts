const {Cc, Ci} = require("chrome");

let prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
let accelKey = prefs.getBranch("ui.key.").getIntPref("accelKey");

let isAccelKeyPressed = function (event) {
  if (17 == accelKey)
    return event.ctrlKey;
  if (18 == accelKey)
    return event.altKey;
  if (224 == accelKey)
    return event.metaKey;

  return false;
}

let equalsEvent = function (event, modifiers) {
  let eventModifiers = {
    "control": event.ctrlKey,
    "accel": isAccelKeyPressed(event),
    "shift": event.shiftKey,
    "meta": event.metaKey,
    "alt": event.altKey
  };

  return modifiers.every(function (mod) eventModifiers[mod.toLowerCase()])
}

exports.equalsEvent = equalsEvent;
