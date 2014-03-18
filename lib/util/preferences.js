/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {Cc, Ci} = require("chrome");

let Preferences = {
  _cache: {},
  _branches: {},

  observe: function (aSubject, aTopic, aData) {
    let key = aSubject.root + aData;
    if ("nsPref:changed" == aTopic && key in this._cache)
      delete this._cache[key];
  },

  uninit: function () {
    for (let name in this._branches) {
      this._branches[name].removeObserver("", this);
      delete this._branches[name];
    }
  },

  getBranch: function (name) {
    if (name in this._branches)
      return this._branches[name];

    let branch = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch(name);
    branch.QueryInterface(Ci.nsIPrefBranch2);
    branch.addObserver("", this, false);

    return this._branches[name] = branch;
  },

  getIntPref: function (branch, pref) {
    let key = branch + pref;
    if (key in this._cache)
      return this._cache[key];

    return this._cache[key] = this.getBranch(branch).getIntPref(pref);
  }
};

exports.Preferences = Preferences;
