/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is
 * Tim Taubert <tim@timtaubert.de>
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const {Cc, Ci} = require("chrome");
const WINDOW_TYPE = "navigator:browser";

let listeners = [];
let ww = Cc["@mozilla.org/embedcomp/window-watcher;1"].getService(Ci.nsIWindowWatcher);
let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
let browserWindowEnum = wm.getEnumerator(WINDOW_TYPE);

ww.registerNotification({
  observe: function (aSubject, aTopic, aData) {
    // add listeners to new dom window
    if ("domwindowopened" == aTopic) {
      aSubject.addEventListener("load", function onLoad() {
        aSubject.removeEventListener("load", onLoad, false);
        if (WINDOW_TYPE == aSubject.document.documentElement.getAttribute("windowtype")) {
          listeners.forEach(function (listener) {
            aSubject.addEventListener(listener.type, listener.callback, false);
          });
        }
      }, false);
    // remove listeners from closed dom window
    } else if ("domwindowclosed" == aTopic) {
      if (WINDOW_TYPE == aSubject.document.documentElement.getAttribute("windowtype")) {
        listeners.forEach(function (listener) {
          aSubject.removeEventListener(listener.type, listener.callback, false);
        });
      }
    }
  }
});

let addEventListener = function (type, callback) {
  for (let window in getWindows())
    window.addEventListener(type, callback, false);

  listeners.push({type: type, callback: callback});
}

let removeEventListener = function (type, callback) {
  for (let window in getWindows())
    window.removeEventListener(type, callback, false);

  listeners = listeners.filter(function (listener) {
    return type == listener.type && callback == listener.callback;
  });
}

let getWindows = function () {
  while (browserWindowEnum.hasMoreElements())
    yield browserWindowEnum.getNext();
}

let getMostRecentWindow = function () {
  return wm.getMostRecentWindow(WINDOW_TYPE);
}

let getElementById = function (id) {
  return getMostRecentWindow().document.getElementById(id);
}

exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;
exports.getElementById = getElementById;
