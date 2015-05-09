/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const gHotKeys = (function () {

  let allHotKeys = new Map();

  self.port.on("hotkeys", function (hotkeys) {
    allHotKeys = new Map();

    for (let id of Object.keys(hotkeys)) {
      allHotKeys.set(id, hotkeys[id]);
    }
  });

  return {
    get(id) {
      return allHotKeys.get(id);
    },

    getCombination(hotkey) {
      return gModifiers.toText(hotkey.modifiers) +
             hotkey.key[0].toUpperCase() +
             hotkey.key.slice(1);
    },

    find(fun) {
      return [...allHotKeys.values()].find(fun);
    },

    filter(fun) {
      let filtered = new Map();

      for (let key of allHotKeys.values()) {
        if (fun(key)) {
          filtered.set(key.id, key);
        }
      }

      return filtered;
    }
  };
})();
