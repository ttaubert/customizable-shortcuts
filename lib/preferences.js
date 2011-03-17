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

let keys = require("keys");
let overlays = require("overlays");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

let delegate = {
  onTrack: function (window) {
    if ("BrowserPreferences" == window.document.documentElement.getAttribute("id"))
      new ShortcutsPane(window).attach(window);
  },
  onUntrack: function () {}
};

let winUtils = require("window-utils");
let windowTracker = new winUtils.WindowTracker(delegate);

let ShortcutsPane = function (window) {
  let createElement = function (tag) {
    return window.document.createElementNS(XUL_NS, tag);
  }

  this.element = createElement("prefpane");
  this.element.setAttribute("id", "paneShortcuts");
  this.element.setAttribute("label", "Shortcuts");

  let self = this;

  let createTextBox = function () {
    let hbox = createElement("hbox");
    self.element.appendChild(hbox);

    let textbox = createElement("textbox");
    textbox.setAttribute("id", "filter");
    textbox.setAttribute("flex", 1);
    textbox.setAttribute("type", "search");
    textbox.setAttribute("placeholder", "Search");
    hbox.appendChild(textbox);
  }

  let createSeparator = function () {
    let sep = createElement("separator");
    sep.setAttribute("class", "thin");
    self.element.appendChild(sep);
  }

  let createTree = function () {
    let preferenceTreeRenderer = new PreferenceTreeRenderer(window);
    let tree = preferenceTreeRenderer.render();
    self.element.appendChild(tree);
  }

  createTextBox();
  createSeparator();
  createTree();
}

ShortcutsPane.prototype.attach = function (window) {
  let prefwindow = window.document.documentElement;
  prefwindow.addPane(this.element);

  window.sizeToContent();
  window.centerWindowOnScreen();
}

let PreferenceTreeRenderer = function (window) {
  this.window = window;
}

PreferenceTreeRenderer.prototype.createElement = function (tag) {
  return this.window.document.createElementNS(XUL_NS, tag);
}

PreferenceTreeRenderer.prototype.render = function () {
  let tree = this.createElement("tree");
  tree.setAttribute("flex", 1);
  tree.setAttribute("rows", 2);

  let cols = this.createElement("treecols");
  tree.appendChild(cols);

  let colAction = this.createElement("treecol");
  colAction.setAttribute("id", "colSAction");
  colAction.setAttribute("label", "Action");
  colAction.setAttribute("flex", 1);
  cols.appendChild(colAction);

  let colShortcut = this.createElement("treecol");
  colShortcut.setAttribute("id", "colShortcut");
  colShortcut.setAttribute("label", "Shortcut");
  colShortcut.setAttribute("flex", 1);
  cols.appendChild(colShortcut);

  let children = this.createElement("treechildren");
  tree.appendChild(children);

  for (let key in keys.findAll()) {
    let item = this.renderKey(key);
    children.appendChild(item);
  }

  return tree;
}

PreferenceTreeRenderer.prototype.renderKey = function (key) {
  let item = this.createElement("treeitem");
  let row = this.createElement("treerow");
  item.appendChild(row);

  let cell1 = this.createElement("treecell");
  cell1.setAttribute("label", key.action);
  row.appendChild(cell1);

  let overlay = overlays.findByShortcut(key.shortcut);
  let shortcut = (overlay ? overlay.shortcut : key.shortcut);

  let cell2 = this.createElement("treecell");
  cell2.setAttribute("label", shortcut.toString());
  row.appendChild(cell2);

  return item;
}
