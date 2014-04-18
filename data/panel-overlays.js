/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let overlays = (function () {

  let overlays = new Map();

  function has(id) {
    return overlays.has(id);
  }

  function get(id) {
    return overlays.get(id);
  }

  function set(id, modifiers, keycode) {
    overlays.set(id, {modifiers: modifiers, keycode: keycode});
    //self.port.emit("new-overlay", shortcutData);
  }

  function clear(id) {
    overlays.delete(id);
  }

  return {has: has, get: get, set: set, clear: clear};
})();
