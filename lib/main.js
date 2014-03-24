/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const utils = require("sdk/window/utils");
const winUtils = require("sdk/deprecated/window-utils");
const prefpane = require("prefs/prefpane");
const bug645371 = require("patch/bug-645371");
const {Overlays} = require("core/overlay");
const {Shortcut} = require("core/shortcut");

new winUtils.WindowTracker({
  onTrack: function (window) {
    if (utils.isBrowser(window)) {
      bug645371.applyPatch(window);
      window.addEventListener("keydown", handlePossibleShortcut);
    } else if (isPrefDialog(window)) {
      prefpane.create(window);
    }
  },

  onUntrack: function (window) {
    if (utils.isBrowser(window)) {
      window.removeEventListener("keydown", handlePossibleShortcut);
    }
  }
});

function isPrefDialog(window) {
  let windowID = window.document.documentElement.getAttribute("id");
  return windowID == "BrowserPreferences";
}

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
