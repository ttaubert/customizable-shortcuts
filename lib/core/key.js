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

let {getElementById, createEvent} = require("util/browser-windows");
let Shortcut = require("core/shortcut").Shortcut;
let Modifiers = require("core/modifiers").Modifiers;

let Key = function (data) {
  let element = getElementById(data.id);

  this.id = data.id;
  this.element = element;
  this.key = element.getAttribute("key").toUpperCase().charCodeAt(0);
  this.keycode = element.getAttribute("keycode");
  this.command = element.getAttribute("command");

  if (element.hasAttribute("modifiers"))
    this.modifiers = new Modifiers({modifiers: element.getAttribute("modifiers").split(",")});

  this.shortcut = new Shortcut({key: this.key, keycode: this.keycode, modifiers: this.modifiers});
}

Key.prototype.executeCommand = function () {
  if (this.element.hasAttribute("command")) {
    let command = this.element.getAttribute("command");
    command = getElementById(command);
    command && command.doCommand();
    return;
  }

  if (this.element.hasAttribute("oncommand")) {
    let sourceEvent = createEvent("Events");
    sourceEvent.initEvent("command", false, false);
    let event = createEvent("XULCommandEvents");
    event.initCommandEvent("command", true, false, null, null, false, false, false, false, sourceEvent);
    this.element.dispatchEvent(event);
  }
}

let Keys = {
  _keys: null,

  _loadKeys: function () {
    this._keys = [];

    let children = getElementById("mainKeyset").childNodes;
    for (let c = 0; c < children.length; c++) {
      let key = children[c];
      if (key.hasAttribute("id"))
        this._keys.push(new Key({id: key.getAttribute("id")}));
    }
  },

  get keys() {
    if (!this._keys)
      this._loadKeys();

    return this._keys;
  }
}

exports.Key = Key;
exports.Keys = Keys;
