/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let buttons = (function () {

  let edit = document.getElementById("edit");
  let reset = document.getElementById("reset");

  function update() {
    let id = tree.selected;
    edit.disabled = !id;
    reset.disabled = !overlays.has(id);
  }

  edit.addEventListener("command", function () {
    tree.editSelectedRow();
  });

  reset.addEventListener("command", function () {
    overlays.clear(tree.selected);
    tree.invalidateSelectedRow();
    reset.disabled = true;
  });

  return {update: update};
})();
