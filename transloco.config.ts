import type { TranslocoConfig } from '@jsverse/transloco-keys-manager';

/**
 * Nx targets:
 * - nx run client:i18n-extract
 * - nx run client:i18n-find
 */
const config: TranslocoConfig = {
  langs: ['fr', 'en'],
};

export default config;
