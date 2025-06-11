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

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    await this.supabaseService.sessionReady;
    if (!this.supabaseService.isAuthenticated) {
      // Only redirect if session is ready and user is not authenticated
      return this.router.createUrlTree(['/login']);
    }
    return true;
  }
}
