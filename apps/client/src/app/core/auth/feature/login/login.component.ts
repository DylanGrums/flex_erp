import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { firstValueFrom } from 'rxjs';

import { AuthManagerService } from '../../data-access/auth-manager.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Store } from '@ngxs/store';
import { Login } from '../../data-access/auth.actions';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    DividerModule,
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  error = false;
  rememberMe = false;

  private readonly _fb = inject(FormBuilder);
  private readonly _authManager = inject(AuthManagerService);
  private readonly _router = inject(Router);


  private readonly ref = inject(DynamicDialogRef);

  private readonly _store = inject(Store);

  ngOnInit(): void {
    this.loginForm = this._fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.error = false;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    try {
      this._store.dispatch(new Login(this.loginForm.value)).subscribe((user) => {
        const authed = this._store.selectSnapshot(isAuthenticated => isAuthenticated);
        if (authed) this.ref.close(user)
      });
    } catch (err) {
      this.error = true;
      console.error(err);
    }
  }

  onReset(): void {
    this.submitted = false;
    this.loginForm.reset();
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
