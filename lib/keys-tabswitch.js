/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {Ci} = require("chrome");
const winUtils = require("sdk/deprecated/window-utils");

const ID_NEXT = "key_switchToNextTab";
const ID_PREV = "key_switchToPrevTab";

const LABEL_NEXT = "Switch To Next Tab";
const LABEL_PREV = "Switch To Previous Tab";

function advanceSelectedTab(reverse) {
  let window = winUtils.activeBrowserWindow;
  let gBrowser = window.gBrowser;
  let offset = reverse ? 1 : -1;

  if (window.getComputedStyle(gBrowser, null).direction == "ltr") {
    offset *= -1;
  }

  gBrowser.tabContainer.advanceSelectedTab(offset, true);
}

exports.register = function (keys) {
  keys[ID_NEXT] = {
    id: ID_NEXT,
    label: LABEL_NEXT,
    modifiers: ["meta", "shift"],
    code: Ci.nsIDOMKeyEvent.DOM_VK_CLOSE_BRACKET,
    text: "]",
    command: () => advanceSelectedTab(false)
  };

  keys[ID_PREV] = {
    id: ID_PREV,
    label: LABEL_PREV,
    modifiers: ["meta", "shift"],
    code: Ci.nsIDOMKeyEvent.DOM_VK_OPEN_BRACKET,
    text: "[",
    command: () => advanceSelectedTab(true)
  };
};
