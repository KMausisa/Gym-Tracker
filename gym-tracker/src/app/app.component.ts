
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SupabaseService } from './services/supabase.service';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Gym Tracker';

  isAuthenticated: boolean = false;
  isSessionReady: boolean = false;
  userId: string | null = null;
  userProfile: any = null;

  constructor(private supabaseService: SupabaseService) {
    this.supabaseService.sessionReady.then(() => {
      this.isSessionReady = true;
    });
  }

  ngOnInit() {
    // Set initial authentication state
    this.isAuthenticated = this.supabaseService.isAuthenticated;
    this.userId = this.supabaseService.userId;

    // Listen for auth state changes
    this.supabaseService.currentUser.subscribe((user) => {
      this.isAuthenticated = !!user;
      this.userId = user?.id || null;

      // Load user profile when authenticated
      if (this.isAuthenticated) {
        this.loadUserProfile();
      } else {
        this.userProfile = null;
      }
    });
  }

  async loadUserProfile() {
    try {
      this.userProfile = await this.supabaseService.getCurrentUserProfile();
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  logout() {
    this.supabaseService.signOut();
  }
}
