/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let conflicts = (function () {

  let box = document.getElementById("notifications");

  function sameModifiers(m1, m2) {
    if (m1.length != m2.length) {
      return false;
    }

    m2 = new Set(m2);

    for (let modifier of m1) {
      if (!m2.has(modifier)) {
        return false;
      }
    }

    return true;
  }

  function findConflict(id, modifiers, code) {
    return keys.find((kid, key) => {
      // Skip the original key.
      if (kid == id) {
        return false;
      }

      let overlay = overlays.get(kid) || key;

      if (!overlay || overlay.disabled) {
        return false;
      }

      if (sameModifiers(overlay.modifiers, modifiers) && overlay.code == code) {
        return true;
      }
    });
  }

  function showWarning(text) {
    box.removeAllNotifications();
    box.appendNotification(
      "\"" + text + "\" has been disabled due to a conflict.",
      null, null, box.PRIORITY_WARNING_LOW, null);
  }

  return {
    findAndDisable: function (id, modifiers, code) {
      let conflict = findConflict(id, modifiers, code);

      if (conflict) {
        showWarning(conflict.label);
        overlays.disable(conflict.id);
      }
    },

    findAndDisableByID: function (id) {
      let key = keys.get(id);
      this.findAndDisable(id, key.modifiers, key.code);
    }
  };
})();
