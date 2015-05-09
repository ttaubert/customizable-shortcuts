/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const gButtons = (function () {

  let edit = document.getElementById("edit");
  let reset = document.getElementById("reset");
  let close = document.getElementById("close");
  let enable = document.getElementById("enable");
  let disable = document.getElementById("disable");

  function update() {
    // Reset all button states.
    edit.disabled = reset.disabled = enable.disabled = disable.disabled = true;
    disable.hidden = false;
    enable.hidden = true;

    let id = gTree.selected;
    let overlay = gOverlays.get(id);

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

  close.addEventListener("command", function () {
    self.port.emit("hide");
  });

  edit.addEventListener("command", function () {
    gTree.editSelectedRow();
  });

  reset.addEventListener("command", function () {
    gOverlays.clear(gTree.selected);
    gTree.invalidateSelectedRow();
    update();

    // Disable any conflicting shortcuts and show a warning.
    gConflicts.findAndDisableByID(gTree.selected);
  });

  enable.addEventListener("command", function () {
    gOverlays.clear(gTree.selected);
    gTree.invalidateSelectedRow();
    update();

    // Disable any conflicting shortcuts and show a warning.
    gConflicts.findAndDisableByID(gTree.selected);
  });

  disable.addEventListener("command", function () {
    gOverlays.disable(gTree.selected);
    gTree.invalidateSelectedRow();
    update();
  });

  return {update};
})();
