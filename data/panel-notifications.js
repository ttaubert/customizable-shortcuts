/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let notifications = (function () {

  let box = document.getElementById("notifications");

  return {
    add: function (key) {
      box.removeAllNotifications();
      box.appendNotification(
        "\"" + key.label + "\" has been disabled due to a conflict.",
        null, null, box.PRIORITY_WARNING_LOW, null);
    }
  };
})();
