import { AuthCredentials, AuthTokenResponse } from '@flex-erp/auth/types';

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: AuthCredentials) { }
}

export class LoginSuccess {
  static readonly type = '[Auth] Login Success';
  constructor(public payload: AuthTokenResponse) { }
}

export class LoginFailed {
  static readonly type = '[Auth] Login Failed';
  constructor(public error: string) { }
}

export class LoadMe {
  static readonly type = '[Auth] Load Me';
}

export class Refresh {
  static readonly type = '[Auth] Refresh';
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class ClearError {
  static readonly type = '[Auth] Clear Error';
}

