/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const gModifiers = (function () {
  const MODIFIER_NAMES = new Set(["Control", "Shift", "Meta", "Alt", "OS", "AltGraph"]);
  const MODIFIER_KEYS = {16: "shift", 17: "control", 18: "alt", 91: "meta", 92: "meta", 224: "meta"};

  const MODIFIER_CONTROL = 1;
  const MODIFIER_META    = 2;
  const MODIFIER_SHIFT   = 4;
  const MODIFIER_ALT     = 8;

  return {
    isModifier(key) {
      return MODIFIER_NAMES.has(key);
    },

    fromEvent(event) {
      let modifiers = 0;

      if (event.getModifierState("Control") || event.getModifierState("AltGraph")) {
        modifiers |= MODIFIER_CONTROL;
      }

      if (event.getModifierState("Shift")) {
        modifiers |= MODIFIER_SHIFT;
      }

      if (event.getModifierState("Meta") || event.getModifierState("OS")) {
        modifiers |= MODIFIER_META;
      }

      if (event.getModifierState("Alt") || event.getModifierState("AltGraph")) {
        modifiers |= MODIFIER_ALT;
      }

      return modifiers;
    },

    fromAttribute(attr, accelKey) {
      let parts = new Set(attr.toLowerCase().split(/[,\s]/));

      if (parts.has("accel")) {
        parts.add(MODIFIER_KEYS[accelKey] || "control");
        parts.delete("accel");
      }

      let modifiers = 0;

      if (parts.has("control")) {
        modifiers |= MODIFIER_CONTROL;
      }

      if (parts.has("shift")) {
        modifiers |= MODIFIER_SHIFT;
      }

      if (parts.has("meta")) {
        modifiers |= MODIFIER_META;
      }

      if (parts.has("alt")) {
        modifiers |= MODIFIER_ALT;
      }

      return modifiers;
    },

    toText(modifiers) {
      let parts = [];

      if (modifiers & MODIFIER_CONTROL) {
        parts.push("Ctrl + ");
      }

      if (modifiers & MODIFIER_META) {
        let text = "";
        if (gPlatform == "darwin") {
          text = "Cmd";
        } else if (gPlatform == "linux") {
          text = "Super";
        } else if (gPlatform == "winnt") {
          text = "Win";
        }

        if (text) {
          parts.push(`${text} + `);
        }
      }

      if (modifiers & MODIFIER_SHIFT) {
        parts.push("Shift + ");
      }

      if (modifiers & MODIFIER_ALT) {
        parts.push("Alt + ");
      }

      return parts.join("");
    }
  }
})();
