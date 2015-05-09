/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const gConflicts = (function () {

  let box = document.getElementById("notifications");

  function findConflict(id, modifiers, key) {
    return gHotKeys.find(hotkey => {
      // Skip the original key.
      if (hotkey.id == id) {
        return false;
      }

      let overlay = gOverlays.get(hotkey.id) || hotkey;
      if (!overlay || overlay.disabled) {
        return false;
      }

      return overlay.modifiers == modifiers && overlay.key == key;
    });
  }

  function showWarning(text) {
    box.removeAllNotifications();
    box.appendNotification(
      `"${text}" has been disabled due to a conflict.`,
      null, null, box.PRIORITY_WARNING_LOW, null);
  }

  return {
    find(id, modifiers, key) {
      return findConflict(id, modifiers, key);
    },

    findAndDisable(id, modifiers, key) {
      let conflict = findConflict(id, modifiers, key);

      if (conflict) {
        showWarning(conflict.label);
        gOverlays.disable(conflict.id);
      }
    },

    findAndDisableByID(id) {
      let hotkey = gHotKeys.get(id);
      this.findAndDisable(id, hotkey.modifiers, hotkey.key);
    }
  };
})();
