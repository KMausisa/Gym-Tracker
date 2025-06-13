import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
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
}
