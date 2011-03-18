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

let storage = require("simple-storage").storage;

// TODO remove, for testing only
storage.overlays = [
  {key: "key_fullScreen", shortcut: {keycode: "VK_F5"}}
];

let Key = require("keys").Key;
let Shortcut = require("shortcuts").Shortcut;

let Overlay = function (data, options) {
  this.key = data.key;
  this.shortcut = data.shortcut;

  // TODO move into Overlays.create()
  let idx = data.key.shortcut.toString();

  if (idx in Overlays.overlays)
    delete Overlays.overlays[idx];

  if (!this.key.shortcut.equals(this.shortcut))
    Overlays.overlays[idx] = this;

  if (!options || !options.dontStore)
    Overlays._storeOverlays();
}

Overlay.prototype.serialize = function () {
  return {key: this.key.serialize(), shortcut: this.shortcut.serialize()};
}

Overlay.unserialize = function (data) {
  return new Overlay({
    key: Key.unserialize(data.key),
    shortcut: Shortcut.unserialize(data.shortcut)
  }, {dontStore: true});
}

let Overlays = {
  _overlays: null,

  _loadOverlays: function () {
    this._overlays = {};
    (storage.overlays || []).map(Overlay.unserialize);
  },

  _storeOverlays: function () {
    storage.overlays = [];
    for (let [key, overlay] in Iterator(this.overlays))
      storage.overlays.push(overlay.serialize());
  },

  get overlays() {
    if (!this._overlays)
      this._loadOverlays();

    return this._overlays;
  },

  findByShortcut: function (shortcut) {
    let key = shortcut.toString();
    if (key in this.overlays)
      return this.overlays[key];
  }
}

exports.Overlay = Overlay;
exports.Overlays = Overlays;
