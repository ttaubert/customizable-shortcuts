/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// Remove HTML styles injected by the add-on SDK.
addEventListener("load", function () {
  for (let style of document.querySelectorAll("style")) {
    style.remove();
  }

  // TODO do on show?
  self.port.emit("tree-data", "");

  // Update the tree when the filter text changes.
  let textbox = document.getElementById("filter");
  textbox.addEventListener("command", () => {
    self.port.emit("tree-data", textbox.value);
  });
});

self.port.on("tree-data", function (data) {
  unsafeWindow.document.getElementById("shortcutsTree").view = new TreeView(data);
});
