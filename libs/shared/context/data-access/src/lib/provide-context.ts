import { APP_INITIALIZER, Provider, inject } from '@angular/core';

import { ContextFacade } from './context.facade';

export function provideAppContext(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const facade = inject(ContextFacade);
        return () => {
          facade.hydrate().subscribe();
          return Promise.resolve();
        };
      },
    },
  ];
}
