const { join } = require('path');


/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  presets: [require('../../packages/ui-preset')],
  plugins: [require('tailwindcss-primeui')],


  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../../libs/shared/ui/src/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../../libs/store/ui/src/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../../libs/cms/**/!(*.stories|*.spec).{ts,html}'),
  ],


};
