import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthCredentials } from '@flex-erp/auth/types';
import { Login } from '@flex-erp/auth/data-access';
import { LoginFormComponent } from '@flex-erp/auth/ui';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [LoginFormComponent],
})
export class LoginComponent {
  error = false;

  private store = inject(Store);
  private dialogRef = inject(DynamicDialogRef, { optional: true });

  onSubmit(credentials: AuthCredentials): void {
    this.error = false;
    try {
      this.store.dispatch(new Login(credentials)).subscribe((user) => {
        const authed = this.store.selectSnapshot((isAuthenticated) => isAuthenticated);
        if (authed && this.dialogRef) this.dialogRef.close(user);
      });
    } catch (err) {
      this.error = true;
      console.error(err);
    }
  }

  onReset(): void {
    this.error = false;
  }

  loginWithGoogle(): void {
    console.warn('Google login is not configured yet.');
  }

  loginWithGithub(): void {
    console.warn('GitHub login is not configured yet.');
  }

  loginWithDiscord(): void {
    console.warn('Discord login is not configured yet.');
  }
}
