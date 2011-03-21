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

let {Keys} = require("keys");
let {TreeView} = require("treeview");
let {Overlays} = require("overlays");
let {PreferenceTree} = require("preference-tree");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

let delegate = {
  onTrack: function (window) {
    if ("BrowserPreferences" == window.document.documentElement.getAttribute("id"))
      new PreferencePane(window);
  },
  onUntrack: function () {}
};

let winUtils = require("window-utils");
let windowTracker = new winUtils.WindowTracker(delegate);

let PreferencePane = function (window) {
  this.window = window;

  this.element = this.createElement("prefpane");
  this.element.setAttribute("id", "paneShortcuts");
  this.element.setAttribute("label", "Shortcuts");

  this.prefwindow = window.document.documentElement;
  this.prefwindow.addPane(this.element);

  window.sizeToContent();
  window.centerWindowOnScreen();

  let self = this;

  let onSelect = function () {
    if (self.element.selected)
      self.show();
    else
      self.hide();
  };

  window.addEventListener("select", function (event) {
    if (self.prefwindow == event.target)
      window.setTimeout(onSelect, 0);
  }, false);

  let doc = window.document;
  let link = require("self").data.url("prefs.css");
  let style = doc.createProcessingInstruction("xml-stylesheet", 'href="' + link + '"');
  doc.insertBefore(style, doc.firstChild);
}

PreferencePane.prototype = {
  _built: false,

  createElement: function (tag, parent) {
    let element = this.window.document.createElementNS(XUL_NS, tag);
    parent && parent.appendChild(element);
    return element;
  },

  _build: function () {
    if (this._built)
      return;

    this._built = true;

    this.extra1 = this.prefwindow.getButton("extra1");
    this.extra1.label = "Reset";
    this.extra2 = this.prefwindow.getButton("extra2");
    this.extra2.label = "Edit";
    this.extra1.disabled = this.extra2.disabled = true;
    this.extra1.hidden = this.extra2.hidden = false;

    let self = this;

    this.extra1.addEventListener("command", function () {
      let row = self.treeElement.currentIndex;
      let column = self.treeElement.columns.getLastColumn();
      let index = self.treeElement.view.getCellValue(row, column);
      let key = Keys.keys[index];
      Overlays.removeByKey(key);
      self.extra1.disabled = true;
    }, false);

    this.extra2.addEventListener("command", function () {
      let row = self.treeElement.currentIndex;
      let column = self.treeElement.columns.getLastColumn();
      self.treeElement.startEditing(row, column);
    }, false);

    let tree = new PreferenceTree(this.window);
    this.treeElement = tree.toElement();

    let hbox = this.createElement("hbox", this.element);
    let textbox = this.createElement("textbox", hbox);
    textbox.setAttribute("id", "filter");
    textbox.setAttribute("flex", 1);
    textbox.setAttribute("type", "search");
    textbox.setAttribute("placeholder", "Search");

    textbox.addEventListener("command", function () {
      self.treeElement.view = new TreeView(textbox.value);
    }, false);

    let sep = this.createElement("separator", this.element);
    sep.setAttribute("class", "thin");

    this.element.appendChild(this.treeElement);
    this.window.setTimeout(function () self.treeElement.view = new TreeView(), 0);
  },

  show: function () {
    this._build();
  },

  hide: function () {
    this.extra1.hidden = this.extra2.hidden = true;
  }
};
