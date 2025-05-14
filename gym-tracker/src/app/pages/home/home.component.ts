import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { HeaderComponent } from '../../header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  user: any;
  profile: any = {};
  isLoading = true;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.supabaseService.currentUser.subscribe(async (user) => {
      this.user = user;

      if (user) {
        // Load user profile data including name and birthday
        try {
          const profileData = await this.supabaseService.getUserProfile(
            user.id
          );
          if (profileData) {
            this.profile = profileData;
          } else {
            // Fallback to metadata if profile doesn't exist in the profiles table
            this.profile = {
              full_name: user.user_metadata?.full_name || 'User',
              birthday: user.user_metadata?.birthday || 'Not provided',
            };
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          this.isLoading = false;
        }
      }
    });
  }

  // Format birthday date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'Not provided';

    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  logout() {
    this.supabaseService.signOut();
  }
}
