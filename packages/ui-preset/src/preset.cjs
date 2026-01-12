const plugin = require("./plugin.cjs");

// Medusa keeps `content: []` in the preset. Consumers must provide their own `content`.
const preset = {
  content: [],
  plugins: [plugin, require("tailwindcss-animate")],
};

module.exports = { preset };
