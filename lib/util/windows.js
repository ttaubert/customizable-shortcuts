/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

const winUtils = require("sdk/deprecated/window-utils");
const utils = require("sdk/window/utils");

let listeners = [];

new winUtils.WindowTracker({
  onTrack: function (window) {
    if (utils.isBrowser(window)) {
      listeners.forEach(function (listener) {
        window.addEventListener(listener.type, listener.callback, false);
      });
    }
  },

  onUntrack: function (window) {
    if (utils.isBrowser(window)) {
      listeners.forEach(function (listener) {
        window.removeEventListener(listener.type, listener.callback, false);
      });
    }
  }
});

let Windows = {
  addEventListener: function (type, callback) {
    for (let window of utils.windows())
      window.addEventListener(type, callback, false);

    listeners.push({type: type, callback: callback});
  },

  removeEventListener: function (type, callback) {
    for (let window of utils.windows())
      window.removeEventListener(type, callback, false);

    listeners = listeners.filter(function (listener) {
      return !(type == listener.type && callback == listener.callback);
    });
  },

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
