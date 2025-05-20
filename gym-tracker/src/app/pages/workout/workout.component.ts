import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { WorkoutService } from './workout.service';
import { Subscription } from 'rxjs';
import { WorkoutListComponent } from './workout-plan-list/workout-plan-list.component';

@Component({
  selector: 'app-workout',
  imports: [CommonModule, RouterOutlet, WorkoutListComponent],
  standalone: true,
  templateUrl: './workout.component.html',
  styleUrl: './workout.component.css',
})
export class WorkoutComponent implements OnInit, OnDestroy {
  user: any;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  userWorkouts: any[] = []; // Array to store user workouts
  private subscriptions = new Subscription();

  constructor(
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.supabaseService.currentUser.subscribe((user) => {
        this.user = user;
        this.isLoading = false;
        if (this.user) {
          this.workoutService.getUserWorkoutPlans(this.user.id);
        }
      })
    );
  }

  get isOnNewRoute() {
    return this.router.url.endsWith('/new');
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
