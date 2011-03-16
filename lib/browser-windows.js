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
