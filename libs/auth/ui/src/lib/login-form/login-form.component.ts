import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthCredentials } from '@flex-erp/auth/types';
import { TranslocoModule } from '@jsverse/transloco';
import { Eye, EyeOff, LogIn, LucideAngularModule, Mail } from 'lucide-angular';
import { FlexCheckboxComponent } from '@flex-erp/shared/ui';

@Component({
  selector: 'auth-login-form',
  standalone: true,
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexCheckboxComponent,
    LucideAngularModule,
    TranslocoModule,
  ],
})
export class LoginFormComponent implements OnInit {
  readonly Mail = Mail;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly LogIn = LogIn;

  @Input() error = false;
  @Input() loading = false;
  @Output() submitLogin = new EventEmitter<AuthCredentials>();
  @Output() resetForm = new EventEmitter<void>();

  loginForm!: FormGroup;
  submitted = false;
  rememberMe = false;
  showPassword = false;

  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitLogin.emit(this.loginForm.value as AuthCredentials);
  }

  onReset(): void {
    this.submitted = false;
    this.loginForm.reset();
    this.resetForm.emit();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
