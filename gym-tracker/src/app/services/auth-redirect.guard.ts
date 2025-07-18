// auth-redirect.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthRedirectGuard implements CanActivate {
  constructor(private supabase: SupabaseService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    await this.supabase.sessionReady; // Wait for session init
    if (this.supabase.isAuthenticated) {
      return this.router.createUrlTree(['/dashboard']);
    }
    return true;
  }
}
