/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {Key, Keys} = require("core/key");
const {Shortcut} = require("core/shortcut");
const {Modifiers} = require("core/modifiers");

function serialize(data) {
  if (!data)
    return;

  let Overlay = require("core/overlay").Overlay;

  if (data instanceof Overlay)
    return {_type: "overlay", key: serialize(data.key), shortcut: serialize(data.shortcut)};

  if (data instanceof Key)
    return {_type: "key", id: data.id};

  if (data instanceof Shortcut)
    return {_type: "shortcut", key: data.key, keycode: data.keycode, modifiers: serialize(data.modifiers)};

  if (data instanceof Modifiers)
    return {_type: "modifiers", modifiers: data.modifiers};

  return data;
}

function unserialize(data) {
  if (!data)
    return;

  let Overlay = require("core/overlay").Overlay;

  if ("overlay" == data._type)
    return new Overlay({key: unserialize(data.key), shortcut: unserialize(data.shortcut)}, {dontStore: true});

  if ("key" == data._type)
    return Keys.keys[data.id];

  if ("shortcut" == data._type)
    return new Shortcut({key: data.key, keycode: data.keycode, modifiers: unserialize(data.modifiers)});

  if ("modifiers" == data._type)
    return new Modifiers({modifiers: data.modifiers});

  return data;
}

exports.serialize = serialize;
exports.unserialize = unserialize;
