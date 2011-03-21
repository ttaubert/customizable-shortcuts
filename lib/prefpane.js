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
let {Overlay} = require("overlays");
let {Shortcut} = require("shortcuts");
let {TreeView} = require("treeview");

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

    window.setTimeout(function () {
      tree.view = new TreeView();
    }, 0);
  }

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

PreferenceTreeRenderer.prototype.createElement = function (tag, parent) {
  let element = this.window.document.createElementNS(XUL_NS, tag);
  parent && parent.appendChild(element);
  return element;
}

PreferenceTreeRenderer.prototype.render = function () {
  let tree = this.createElement("tree");
  tree.setAttribute("seltype", "single");
  tree.setAttribute("editable", true);
  tree.setAttribute("hidecolumnpicker", true);
  tree.setAttribute("disableKeyNavigation", true);
  tree.setAttribute("flex", 1);

  let cols = this.createElement("treecols", tree);

  let colAction = this.createElement("treecol", cols);
  colAction.setAttribute("id", "colAction");
  colAction.setAttribute("label", "Action");
  colAction.setAttribute("flex", 1);

  let colShortcut = this.createElement("treecol", cols);
  colShortcut.setAttribute("id", "colShortcut");
  colShortcut.setAttribute("label", "Shortcut");
  colShortcut.setAttribute("editable", true);
  colShortcut.setAttribute("flex", 1);

  let children = this.createElement("treechildren", tree);

  this.window.addEventListener("keypress", function (event) {
    if (!tree.editingColumn)
      return;

    event.preventDefault();
    event.stopPropagation();

    tree.stopEditing(true);
  }, true);

  this.window.addEventListener("keydown", function (event) {
    if (!tree.editingColumn)
      return;

    event.preventDefault();
    event.stopPropagation();

    let shortcut = Shortcut.fromEvent(event);
    tree.inputField.value = shortcut.toString();

    if (shortcut.isComplete())
      new Overlay({key: Keys.keys[tree.editingRow], shortcut: shortcut});
  }, true);

  return tree;
}
