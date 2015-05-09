/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// Notify the parent that we're ready.
self.port.emit("ready");

// Update the tree when the filter text changes.
let textbox = document.getElementById("filter");
textbox.addEventListener("command", function (event) {
  // Normalize search term and update list of keys.
  gTree.filter(textbox.value.replace(/^\s+||s+$/, "").toLowerCase());
});

textbox.addEventListener("keydown", function (event) {
  if (event.keyCode == KeyEvent.DOM_VK_ESCAPE && textbox.value != "") {
    event.stopPropagation();
  }
}, true);

addEventListener("keydown", function (event) {
  if (event.keyCode == KeyEvent.DOM_VK_ESCAPE) {
    self.port.emit("hide");
  }
});

// Focus the window whenever the panel is shown.
self.port.on("focus", function () {
  window.focus();
});

// Render the tree on first show.
self.port.once("focus", gTree.filter);

let gPlatform;
// Wait for the platform string.
self.port.once("platform", platform => gPlatform = platform);
