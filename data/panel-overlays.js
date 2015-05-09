/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const gOverlays = (function () {

  let overlays = {};

  function send() {
    self.port.emit("overlays", overlays);
  }

  // Listen for updates from the parent.
  self.port.on("overlays", ovs => overlays = ovs);

  return {
    get(id) {
      return overlays[id] || null;
    },

    set(id, modifiers, key) {
      overlays[id] = {modifiers, key};
      send();
    },

    disable(id) {
      overlays[id] = {disabled: true};
      send();
    },

    clear(id) {
      delete overlays[id];
      send();
    }
  };
})();
