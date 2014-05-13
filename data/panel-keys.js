/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let keys = (function () {

  let allKeys = new Map();
  let listeners = new Set();

  self.port.on("keys", function (keys) {
    allKeys = new Map();

    for (let id of Object.keys(keys)) {
      let key = keys[id];
      key.id = id;
      key.combination = getModifiersText(key.modifiers || []) + key.text;
      allKeys.set(key.id, key);
    }

    // Notify listeners.
    for (let listener of listeners) {
      listener();
    }
  });

  return {
    addListener: function (listener) {
      listeners.add(listener);
    },

    get: function (id) {
      return allKeys.get(id);
    },

    find: function (fun) {
      for (let [id, key] of allKeys) {
        if (fun(id, key)) {
          return key;
        }
      }

      return null;
    },

    filter: function (fun) {
      let filtered = new Map();

      for (let [id, key] of allKeys) {
        if (fun(key)) {
          filtered.set(id, key);
        }
      }

      return filtered;
    }
  };
})();
