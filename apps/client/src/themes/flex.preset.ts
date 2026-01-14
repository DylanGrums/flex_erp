import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

export const FlexPreset = definePreset(Aura, {
  semantic: {
    // Optionnel : tu peux aussi redéfinir des palettes si tu veux
    // primary: { ... }

    colorScheme: {
      light: {
        // Couleurs “primaires” (boutons primary, liens, focus, etc.)
        primary: {
          color: 'var(--fg-interactive)',
          inverseColor: 'var(--fg-on-color)',       // texte sur primary bg
          hoverColor: 'var(--fg-interactive-hover)',
          activeColor: 'var(--fg-interactive-hover)',
        },
        highlight: {
          background: 'var(--bg-highlight)',
          focusBackground: 'var(--bg-highlight-hover)',
          color: 'var(--fg-base)',
          focusColor: 'var(--fg-base)',
        },
      },

      dark: {
        // ⚠️ C’est ici que tu corriges le “Medusa rgb(244,244,245) vs toi 255,255,255”
        // Sur beaucoup de composants (dont p-button), PrimeNG utilise primary.inverseColor
        // pour la couleur du texte du bouton “primary”.
        primary: {
          color: 'var(--bg-interactive)',           // fond primary
          inverseColor: 'var(--fg-base)',           // ✅ texte = fg-base (Medusa = 244,244,245)
          hoverColor: 'var(--bg-interactive)',
          activeColor: 'var(--bg-interactive)',
        },
        highlight: {
          background: 'rgba(250, 250, 250, .16)',
          focusBackground: 'rgba(250, 250, 250, .24)',
          color: 'var(--fg-base)',
          focusColor: 'var(--fg-base)',
        },
      },
    },
  },
});
