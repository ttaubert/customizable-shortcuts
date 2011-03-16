const {Cc, Ci} = require("chrome");
const WINDOW_TYPE = "navigator:browser";

let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
let browserWindowEnum = wm.getEnumerator(WINDOW_TYPE);

// TODO later, handle new windows
let addEventListener = function (type, callback) {
  for (let window in getWindows())
    window.addEventListener(type, callback, false);
}

let removeEventListener = function (type, callback) {
  for (let window in getWindows())
    window.removeEventListener(type, callback, false);
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
