/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let buttons = (function () {

  let edit = document.getElementById("edit");
  let reset = document.getElementById("reset");
  let enable = document.getElementById("enable");
  let disable = document.getElementById("disable");

  function update() {
    // Reset all button states.
    edit.disabled = reset.disabled = enable.disabled = disable.disabled = true;
    disable.hidden = false;
    enable.hidden = true;

    let id = tree.selected;
    let overlay = overlays.get(id);

    if (id) {
      edit.disabled = false;
      disable.disabled = false;
    }

    if (overlay) {
      reset.disabled = false;
    }

    if (overlay && overlay.disabled) {
      enable.hidden = enable.disabled = false;
      disable.hidden = disable.disabled = true;
      edit.disabled = reset.disabled = true;
    }
  }

  edit.addEventListener("command", function () {
    tree.editSelectedRow();
  });

  reset.addEventListener("command", function () {
    overlays.clear(tree.selected);
    tree.invalidateSelectedRow();
    update();
  });

  enable.addEventListener("command", function () {
    overlays.clear(tree.selected);
    tree.invalidateSelectedRow();
    update();
  });

  disable.addEventListener("command", function () {
    overlays.disable(tree.selected);
    tree.invalidateSelectedRow();
    update();
  });

  return {update: update};
})();
