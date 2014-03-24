/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

const winUtils = require("sdk/deprecated/window-utils");

let Windows = {
  getMostRecentWindow: function () {
    return winUtils.activeBrowserWindow;
  },

  getElementById: function (id) {
    return this.getMostRecentWindow().document.getElementById(id);
  },

  querySelector: function (sel) {
    return this.getMostRecentWindow().document.querySelector(sel);
  },

  querySelectorAll: function (sel) {
    return this.getMostRecentWindow().document.querySelectorAll(sel);
  },

  createEvent: function (type) {
    return this.getMostRecentWindow().document.createEvent(type);
  },

  createXulElement: function (tagName, attrs, parent) {
    let element = this.getMostRecentWindow().document.createElementNS(XUL_NS, tagName);

    if (attrs) {
      for (let name in attrs)
        element.setAttribute(name, attrs[name]);
    }

    if (parent)
      parent.appendChild(element);

    return element;
  }
}

exports.Windows = Windows;
