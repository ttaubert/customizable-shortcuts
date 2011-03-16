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
