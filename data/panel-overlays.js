/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let overlays = (function () {

  let overlays = {};

  function send() self.port.emit("overlays", overlays);
  self.port.on("overlays", ovs => overlays = ovs);

  return {
    has: function (id) {
      return id in overlays;
    },

    get: function (id) {
      return overlays[id] || null;
    },

    set: function (id, modifiers, keycode) {
      overlays[id] = {modifiers: modifiers, keycode: keycode};
      send();
    },

    clear: function (id) {
      delete overlays[id];
      send();
    }
  };
})();
