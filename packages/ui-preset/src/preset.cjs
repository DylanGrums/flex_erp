const plugin = require("./plugin.cjs");

const preset = {
  content: [],
  plugins: [plugin, require("tailwindcss-animate")],
};

module.exports = { preset };
