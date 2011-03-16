let modifiers = require("modifiers");
let browserWindows = require("browser-windows");

let Key = function (id) {
  let element = browserWindows.getElementById(id);

  this.key = element.getAttribute("key").toUpperCase().charCodeAt(0);
  this.command = element.getAttribute("command");
  this.modifiers = element.hasAttribute("modifiers") ? element.getAttribute("modifiers").split(",") : [];
}

Key.prototype.equalsEvent = function (event) {
  return (this.key == event.keyCode && modifiers.equalsEvent(event, this.modifiers));
}

Key.prototype.executeCommand = function () {
  let cmd = browserWindows.getElementById(this.command);
  cmd && cmd.doCommand();
}

exports.Key = Key;
