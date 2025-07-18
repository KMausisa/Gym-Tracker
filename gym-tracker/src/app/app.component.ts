import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { User } from './pages/profile/user.model';
import { SupabaseService } from './services/supabase.service';

import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Gym Tracker';

  isAuthenticated: boolean = false;
  isSessionReady: boolean = false;
  userId: string = '';
  userProfile: User | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.supabaseService.loadUser();
    this.supabaseService.sessionReady.then(() => {
      this.isSessionReady = true;
      this.subscribeToAuth();
    });
  }

  ngOnInit(): void {
    this.supabaseService.sessionReady.then(() => {
      console.log('Session is ready');
    });
  }

  subscribeToAuth() {
    this.supabaseService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.isAuthenticated = !!user;
        this.userId = user?.id || null;

        if (this.isAuthenticated) {
          this.loadUserProfile();
        } else {
          this.userProfile = null;
          // this.router.navigate(['/login']);
        }
      });
  }

  /**
   * Loads the user profile data from Supabase.
   * This includes fetching the user's name and birthday.
   * @returns {Promise<void>} - A promise that resolves when the profile is loaded.
   * @throws {Error} - Throws an error if there is an issue fetching the profile data.
   */
  async loadUserProfile() {
    try {
      this.userProfile = await this.supabaseService.getUserProfile(this.userId);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  logout() {
    this.supabaseService.signOut();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
