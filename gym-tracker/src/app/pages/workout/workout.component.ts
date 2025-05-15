import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { WorkoutListComponent } from './workout-list/workout-list.component';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workout',
  imports: [CommonModule, WorkoutListComponent, RouterOutlet],
  standalone: true,
  templateUrl: './workout.component.html',
  styleUrl: './workout.component.css',
})
export class WorkoutComponent implements OnInit {
  user: any;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  userWorkouts: any[] = []; // Array to store user workouts

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.supabaseService.currentUser.subscribe((user) => {
      this.user = user;
      this.isLoading = false;
      if (this.user) {
        this.getUserWorkouts();
      }
    });
  }

  // Get user workouts
  async getUserWorkouts() {
    if (this.user) {
      try {
        const workouts = await this.supabaseService.getUserWorkouts(
          this.user.id
        );
        this.userWorkouts = workouts;
      } catch (error) {
        console.error('Error fetching user workouts:', error);
      }
    }
  }

  get isOnNewRoute() {
    return this.router.url.endsWith('/new');
  }
}
