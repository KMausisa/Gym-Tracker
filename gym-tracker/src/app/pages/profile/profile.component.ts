import { Component, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnDestroy {
  user: any;
  profile!: { name: string; birthday: string };
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.supabaseService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (user) => {
        this.user = user;

        if (user) {
          // Load user profile data including name and birthday
          try {
            const profileData = await this.supabaseService.getUserInfo(user.id);
            if (profileData) {
              this.profile = profileData;
              console.log(this.profile);
            } else {
              // Fallback to metadata if profile doesn't exist in the profiles table
              this.profile = {
                name: user.user_metadata?.full_name || 'User',
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

    const localDate = new Date(dateString + 'T00:00:00');
    return localDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
