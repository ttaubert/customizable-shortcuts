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

self.port.on("findPlugins", function(workerID) { // Look for objects to modify.
    var cssSelectors = self.options.cssSelectors;
    var embeds = (document.querySelectorAll(cssSelectors) || []);
    // embeds && console.warn("DEBUG:	queryselectorall: "+embeds.length);
    for (let i = 0; i < (embeds.length || 0); i++) {
        console.warn("DEBUG:	Embed: " + embeds[i]);
        if (embeds[i].hasAttribute("onClick")) { // If we've already got an onClick, make sure to save it in case the user wants to disable this feature.
            // console.warn("DEBUG:	Item already has onClick property, copying it for reference later.");
            embeds[i].setAttribute("onClickOriginal", embeds[i].getAttribute("onClick"));
        }
        embeds[i].setAttribute("onClick", "this.blur()");

    }
    if (embeds.length < 1) {

        // console.warn ("DEBUG:	Worker ID: "+workerID.number+" found no objects to work on; reporting to addon.");
        self.port.emit("noEmbeds", workerID);


    }

});

self.port.on("removeMods", function removeMods() {
    var cssSelectors = self.options.cssSelectors;
    var embeds = (document.querySelectorAll(cssSelectors) || []);
    embeds && console.warn("DEBUG:	queryselectorall: " + embeds.length);

    for (let i = 0; i < (embeds.length || 0); i++) {

        // console.warn("DEBUG:	Removing mod from Embed: "+embeds[i]);
        embeds[i].removeAttribute("onClick");
        if (embeds[i].hasAttribute("onClickOriginal")) {
            // console.warn("DEBUG:	Item had a previous onClick function, restoring it.");
            embeds[i].setAttribute("onClick", embeds[i].getAttribute("onClickOriginal")); // Restore original function, if available.
            embeds[i].removeAttribute("onClickOriginal");
        }
        // self.port.emit("revertedChanges",[ embeds[i].tagName, embeds[i].id, document.URL ])
    }

});
