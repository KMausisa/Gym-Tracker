import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  /**
   * Activate method to check if the user is authenticated
   * @param route - ActivatedRouteSnapshot
   * @param state - RouterStateSnapshot
   * @returns {Promise<boolean | UrlTree>}  A promise that resolves to true if authenticated, or a UrlTree to redirect to the login page
   * @throws {Error} - Throws an error if the session is not ready or if
   */
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    await this.supabaseService.sessionReady;
    console.log('AuthGuard: Checking authentication status');
    console.log('Is authenticated:', this.supabaseService.isAuthenticated);
    if (!this.supabaseService.isAuthenticated) {
      console.warn('User is not authenticated, redirecting to login page');
      // Redirect to the login page
      return this.router.createUrlTree(['/login']);
    }
    return true;
  }
}
