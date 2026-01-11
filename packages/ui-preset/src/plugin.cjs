const plugin = require("tailwindcss/plugin");

const { FONT_FAMILY_MONO, FONT_FAMILY_SANS } = require("./constants.cjs");
const { theme } = require("./theme/extension/theme.cjs");
const { colors } = require("./theme/tokens/colors.cjs");
const { components } = require("./theme/tokens/components.cjs");
const { effects } = require("./theme/tokens/effects.cjs");
const { typography } = require("./theme/tokens/typography.cjs");

module.exports = plugin(
  function flexUi({ addBase, addComponents, config }) {
    const dm = config("darkMode", "media");
    const arr = ([]).concat(dm);
    const darkMode = arr[0];
    const className = arr[1] ?? ".dark";

    addBase({
      "*": {
        borderColor: "var(--border-base)",
      },
    });

    addComponents(typography);

    addBase({
      ":root": { ...colors.light, ...effects.light },
      ...components.light,
    });

    if (darkMode === "class") {
      addBase({
        [className]: { ...colors.dark, ...effects.dark },
      });

      // In class-mode, apply component overrides on the same selector if present.
      if (components.dark && Object.keys(components.dark).length) {
        addBase({
          [className]: { ...components.dark },
        });
      }
    } else {
      addBase({
        "@media (prefers-color-scheme: dark)": {
          ":root": { ...colors.dark, ...effects.dark },
          ...components.dark,
        },
      });
    }
  },
  {
    theme: {
      extend: {
        ...theme.extend,
        fontFamily: {
          sans: FONT_FAMILY_SANS,
          mono: FONT_FAMILY_MONO,
        },
        transitionProperty: {
          fg: "color, background-color, border-color, box-shadow, opacity",
        },
        keyframes: {
          "accordion-down": {
            from: { height: "0px" },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: "0px" },
          },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
        },
      },
    },
  }
);
