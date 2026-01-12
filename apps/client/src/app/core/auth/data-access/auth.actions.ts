import { User } from "generated/prisma/client";

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: { email: string; password: string }) { }
}

export class LoginSuccess {
  static readonly type = '[Auth] Login Success';
  constructor(public payload: {
    accessToken: string;
    accessTokenExpiresAt: string; // ISO
    user: User;
  }) { }
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

