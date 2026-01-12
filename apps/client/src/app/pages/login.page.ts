import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center p-6">
      <div class="medusa-panel w-full max-w-md p-6">
        <div class="text-lg font-semibold">Login</div>
        <div class="mt-2 text-sm text-ui-fg-subtle">Placeholder public page.</div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {}
