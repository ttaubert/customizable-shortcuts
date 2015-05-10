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

// When the non-empty search box is focused and the user hits ESC
// then don't close the panel but just empty the search box.
textbox.addEventListener("keydown", function (event) {
  if (event.keyCode == KeyEvent.DOM_VK_ESCAPE && textbox.value != "") {
    event.stopPropagation();
  }
}, true);

// Close the panel with ESC.
addEventListener("keydown", function (event) {
  if (event.keyCode == KeyEvent.DOM_VK_ESCAPE) {
    self.port.emit("hide");
  }
});

// Block mouse events from bubbling up to the parent as that listens for
// any clicks and will close the panel if it detects outside clicks.
addEventListener("mousedown", function (event) {
  event.stopPropagation();
});

// Focus the window whenever the panel is shown.
self.port.on("showing", function () {
  window.focus();
});

// Stop editing whenever the panel is hidden.
self.port.on("hiding", gTree.stopEditing);

// Render the tree on first show.
self.port.once("showing", gTree.filter);

let gPlatform;
// Wait for the platform string.
self.port.once("platform", platform => gPlatform = platform);
