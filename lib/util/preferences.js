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
let Preferences = {
    _cache: {},
    _branches: {},

    observe: function(aSubject, aTopic, aData) {
        let key = aSubject.root + aData;
        if ("nsPref:changed" == aTopic && key in this._cache) delete this._cache[key];
    },

    uninit: function() {
        for (let name in this._branches) {
            this._branches[name].removeObserver("", this);
            delete this._branches[name];
        }
    },

    getBranch: function(name) {
        if (name in this._branches) return this._branches[name];

        let branch = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch(name);
        branch.QueryInterface(Ci.nsIPrefBranch2);
        branch.addObserver("", this, false);

        return this._branches[name] = branch;
    },

    getIntPref: function(branch, pref) {
        let key = branch + pref;
        if (key in this._cache) return this._cache[key];

        return this._cache[key] = this.getBranch(branch).getIntPref(pref);
    }
};

exports.Preferences = Preferences;
