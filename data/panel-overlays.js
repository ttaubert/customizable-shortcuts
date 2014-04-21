/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let overlays = (function () {

  let overlays = {};

  function send() self.port.emit("overlays", overlays);
  self.port.on("overlays", ovs => overlays = ovs);

  return {
    get: function (id) {
      return overlays[id] || null;
    },

    set: function (id, modifiers, code, text) {
      overlays[id] = {modifiers: modifiers, code: code, text: text};
      send();
    },

    disable: function (id) {
      overlays[id] = {disabled: true};
      send();
    },

    clear: function (id) {
      delete overlays[id];
      send();
    }
  };
})();
