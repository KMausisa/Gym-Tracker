import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SupabaseService } from './services/supabase.service';
import { HeaderComponent } from './header/header.component';
import { Subscription } from 'rxjs';
import { User } from './pages/profile/user.model';
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

  private authSub?: Subscription;

  constructor(private supabaseService: SupabaseService) {
    this.supabaseService.sessionReady.then(() => {
      this.isSessionReady = true;
      this.subscribeToAuth();
    });
  }

  subscribeToAuth() {
    this.authSub = this.supabaseService.currentUser.subscribe((user) => {
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
    this.authSub?.unsubscribe();
  }
}
