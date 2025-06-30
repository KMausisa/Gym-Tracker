import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
export class AppComponent implements OnDestroy {
  title = 'Gym Tracker';

  isAuthenticated: boolean = false;
  isSessionReady: boolean = false;
  userId: string = '';
  userProfile: User | null = null;

  private destroy$ = new Subject<void>();

  constructor(private supabaseService: SupabaseService) {
    this.supabaseService.loadUser();
    this.supabaseService.sessionReady.then(() => {
      this.isSessionReady = true;
      this.subscribeToAuth();
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
        }
      });
  }

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
