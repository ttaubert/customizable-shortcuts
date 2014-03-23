/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

require("prefs/prefpane");
require("patch/bug-645371");

const winUtils = require("sdk/deprecated/window-utils");
const prefpane = require("prefs/prefpane");
const {Windows} = require("util/windows");
const {Overlays} = require("core/overlay");
const {Shortcut} = require("core/shortcut");

new winUtils.WindowTracker({
  onTrack: function (window) {
    if ("BrowserPreferences" == window.document.documentElement.getAttribute("id")) {
      prefpane.create(window);
    }
  },
  onUntrack: function () {}
});

function handlePossibleShortcut(event) {
  let shortcut = Shortcut.fromEvent(event);

  // check if this is a custom shortcut
  let overlay = Overlays.findByCustomShortcut(shortcut);

  if (overlay) {
    overlay.key.executeCommand();
  } else { // check if this is a shortcut that is overriden by a custom one
    overlay = Overlays.findByOverriddenShortcut(shortcut);
  }

  if (overlay) {
    event.preventDefault();
    event.stopPropagation();
  }
}

exports.main = function (options, callbacks) {
  Windows.addEventListener("keydown", handlePossibleShortcut);
};

exports.onUnload = function (reason) {
  Windows.removeEventListener("keydown", handlePossibleShortcut);
};
