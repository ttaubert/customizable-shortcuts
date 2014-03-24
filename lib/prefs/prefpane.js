/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const self = require("sdk/self");
const keys = require("core/keys");
const {TreeView} = require("prefs/treeview");
const {Overlays} = require("core/overlay");
const {PreferenceTree} = require("prefs/tree");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

exports.create = function (window) {
  // Insert our custom styles.
  createStylesheet(self.data.url("prefs.css"));

  // Create the shortcut tree.
  let tree = new PreferenceTree(window);
  let treeElement = tree.toElement();
  setupExtraButtons(treeElement);

  let dialog = window.document.documentElement;
  let pane = createPane(treeElement);
  dialog.addPane(pane);

  // Set tree view when the pane is in the DOM.
  treeElement.view = new TreeView();

  function setupExtraButtons(tree) {
    let dialog = window.document.documentElement;
    let extra1 = dialog.getButton("extra1");
    let extra2 = dialog.getButton("extra2");

    extra1.label = "Reset";
    extra2.label = "Edit";
    extra1.disabled = extra2.disabled = true;

    // Reset button.
    extra1.addEventListener("command", () => {
      let row = tree.currentIndex;
      let column = tree.columns.getLastColumn();
      let id = tree.view.getCellValue(row, column);
      let key = keys.find(id);
      Overlays.removeByKey(key);
      extra1.disabled = true;
      tree.treeBoxObject.invalidateRow(row);
    });

    // Edit button.
    extra2.addEventListener("command", () => {
      let row = tree.currentIndex;
      let column = tree.columns.getLastColumn();
      tree.startEditing(row, column);
    });

    // Show or hide extra buttons when the prefpane is (de)selected.
    window.addEventListener("select", event => {
      if (event.target == dialog) {
        window.setTimeout(() => extra1.hidden = extra2.hidden = !pane.selected);
      }
    });
  }

  function createPane(tree) {
    let pane = createElement("prefpane");
    pane.setAttribute("id", "paneShortcuts");
    pane.setAttribute("flex", "1");
    pane.setAttribute("label", "Shortcuts");
    pane.appendChild(createElement("preferences"));

    let sep = createElement("separator", pane);
    sep.setAttribute("class", "thin");

    let hbox = createElement("hbox", pane);
    let textbox = createElement("textbox", hbox);
    textbox.setAttribute("id", "filter");
    textbox.setAttribute("flex", "1");
    textbox.setAttribute("type", "search");
    textbox.setAttribute("placeholder", "Search");

    pane.appendChild(tree);

    // Update the tree when the filter text changes.
    textbox.addEventListener("command", () => {
      tree.view = new TreeView(textbox.value);
    });

    return pane;
  }

  function createStylesheet(href) {
    let doc = window.document;
    let style = doc.createProcessingInstruction("xml-stylesheet", 'href="' + href + '"');
    doc.insertBefore(style, doc.querySelector("prefwindow"));
  }

  function createElement(tag, parent = null) {
    let element = window.document.createElementNS(XUL_NS, tag);

    if (parent) {
      parent.appendChild(element);
    }

    return element;
  }
};
