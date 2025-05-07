import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.supabaseService.isLoggedIn()) {
      console.log("User is logged in, access granted.");
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}