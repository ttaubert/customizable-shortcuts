/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let self = require("sdk/self");
let {Keys} = require("core/key");
let winUtils = require("sdk/deprecated/window-utils");
let {TreeView} = require("prefs/treeview");
let {Overlays} = require("core/overlay");
let {PreferenceTree} = require("prefs/tree");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

let delegate = {
  onTrack: function (window) {
    if ("BrowserPreferences" == window.document.documentElement.getAttribute("id"))
      new PreferencePane(window);
  },
  onUntrack: function () {}
};

let windowTracker = new winUtils.WindowTracker(delegate);

let PreferencePane = function (window) {
  this.window = window;

  this._createStylesheet(self.data.url("prefs.css"));

  this.element = this._createElement("prefpane");
  this.element.setAttribute("id", "paneShortcuts");
  this.element.setAttribute("label", "Shortcuts");

  this.element.appendChild(this._createElement("preferences"));

  let prefwindow = window.document.documentElement;
  this.prefwindow = prefwindow;
  this.prefwindow.addPane(this.element);

  window.sizeToContent();
  window.centerWindowOnScreen();

  let onSelect = function () {
    if (this.element.selected)
      this.show();
    else
      this.hide();
  }.bind(this);

  window.addEventListener("select", function (event) {
    if (prefwindow == event.target)
      window.setTimeout(onSelect, 0);
  }.bind(this), false);
}

PreferencePane.prototype = {
  _built: false,

  _createStylesheet: function (href) {
    let doc = this.window.document;
    let style = doc.createProcessingInstruction("xml-stylesheet", 'href="' + href + '"');
    doc.insertBefore(style, doc.querySelector("prefwindow"));
  },

  _createElement: function (tag, parent) {
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
      let id = self.treeElement.view.getCellValue(row, column);
      let key = Keys.keys[id];
      Overlays.removeByKey(key);
      self.extra1.disabled = true;
      self.treeElement.treeBoxObject.invalidateRow(row);
    }, false);

    this.extra2.addEventListener("command", function () {
      let row = self.treeElement.currentIndex;
      let column = self.treeElement.columns.getLastColumn();
      self.treeElement.startEditing(row, column);
    }, false);

    let tree = new PreferenceTree(this.window);
    this.treeElement = tree.toElement();

    let hbox = this._createElement("hbox", this.element);
    let textbox = this._createElement("textbox", hbox);
    textbox.setAttribute("id", "filter");
    textbox.setAttribute("flex", 1);
    textbox.setAttribute("type", "search");
    textbox.setAttribute("placeholder", "Search");

    textbox.addEventListener("command", function () {
      self.treeElement.view = new TreeView(textbox.value);
    }, false);

    let sep = this._createElement("separator", this.element);
    sep.setAttribute("class", "thin");

    this.element.appendChild(this.treeElement);
    this.window.setTimeout(function () self.treeElement.view = new TreeView(), 0);
  },

  show: function () {
    this._build();
  },

  hide: function () {
    if (this.extra1)
      this.extra1.hidden = true;

    if (this.extra2)
      this.extra2.hidden = true;
  }
};
