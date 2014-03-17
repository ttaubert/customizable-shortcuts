/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require("prefs/prefpane");
require("patch/bug-645371");

let {Windows} = require("util/windows");
let {Overlays} = require("core/overlay");
let {Shortcut} = require("core/shortcut");
let {Preferences} = require("util/preferences");

let onKeyDown = function (event) {
  let shortcut = Shortcut.fromEvent(event);

  // check if this is a custom shortcut
  let overlay = Overlays.findByCustomShortcut(shortcut);

  if (overlay)
    overlay.key.executeCommand();
  else // check if this is a shortcut that is overriden by a custom one
    overlay = Overlays.findByOverriddenShortcut(shortcut);

  if (overlay) {
    event.preventDefault();
    event.stopPropagation();
  }
}

exports.main = function (options, callbacks) {
  Windows.addEventListener("keydown", onKeyDown);
};

exports.onUnload = function (reason) {
  Windows.removeEventListener("keydown", onKeyDown);
  Preferences.uninit();
};
