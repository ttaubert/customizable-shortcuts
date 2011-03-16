let modifiers = require("modifiers");

let Shortcut = function (key, modifiers, keyCode) {
  this.getKey = function () key;
  this.getModifiers = function () modifiers;
  this.getKeyCode = function () keyCode;
}

Shortcut.prototype.equalsEvent = function (event) {
  return (this.getKeyCode() == event.keyCode && modifiers.equalsEvent(event, this.getModifiers()));
}

exports.Shortcut = Shortcut;
