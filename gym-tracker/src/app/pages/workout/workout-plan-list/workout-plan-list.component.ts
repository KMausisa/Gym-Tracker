import { Component, OnInit } from '@angular/core';

import { RouterModule, Router } from '@angular/router';

import { User } from '../../profile/user.model';
import { Workout } from '../workout.model';
import { WorkoutService } from '../workout.service';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './workout-plan-list.component.html',
  styleUrl: './workout-plan-list.component.css',
})
export class WorkoutListComponent implements OnInit {
  user!: User;
  userWorkouts: Workout[] = [];
  activeWorkoutId: string = '';
  showActions: boolean = false; // Flag to control visibility of action buttons

  isLoading = true;

  constructor(
    private supaBaseService: SupabaseService,
    private workoutService: WorkoutService,
    private router: Router
  ) {}

  ngOnInit() {
    this.supaBaseService.currentUser.subscribe((user) => {
      this.user = user;
      this.isLoading = false;
    });

    this.workoutService.workoutListChanged.subscribe((workouts) => {
      this.userWorkouts = workouts;
    });

    this.activeWorkoutId = localStorage.getItem('activeWorkoutId') || '';
  }

  // Set and save active workout
  activateWorkout(workoutId: string) {
    this.activeWorkoutId = workoutId;
    localStorage.setItem('activeWorkoutId', workoutId);
  }

  // Reset and remove active workout
  deactivateWorkout(workoutId: string) {
    if (this.activeWorkoutId === workoutId) {
      this.activeWorkoutId = '';
      localStorage.removeItem('activeWorkoutId');
    }
  }

  deleteWorkout(workoutId: string) {
    this.workoutService.deleteWorkout(this.user.id, workoutId);
    this.router.navigate(['/workouts']);
  }
}
