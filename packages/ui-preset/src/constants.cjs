const tailwindFontFamily = {
  sans: [
    "ui-sans-serif",
    "system-ui",
    "sans-serif",
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    '"Noto Color Emoji"',
  ],
  serif: [
    "ui-serif",
    "Georgia",
    "Cambria",
    '"Times New Roman"',
    "Times",
    "serif",
  ],
  mono: [
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    '"Liberation Mono"',
    '"Courier New"',
    "monospace",
  ],
}

const FONT_FAMILY_SANS = ["Inter", ...tailwindFontFamily.sans]
const FONT_FAMILY_MONO = ["Roboto Mono", ...tailwindFontFamily.mono]

module.exports = { FONT_FAMILY_SANS, FONT_FAMILY_MONO };
