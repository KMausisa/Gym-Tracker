import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { User } from '../../profile/user.model';
import { WorkoutPlan } from '../../../models/workout_plan.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
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
  userWorkouts: WorkoutPlan[] = [];
  activeWorkoutId: string = '';
  showActions: boolean = false; // Flag to control visibility of action buttons

  isLoading = false;

  constructor(
    private supaBaseService: SupabaseService,
    private workoutService: WorkoutService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.supaBaseService.currentUser.subscribe((user) => {
      this.user = user;

      if (this.user) {
        this.workoutService.getUserWorkoutPlans(this.user.id);
      }
    });

    this.workoutService.workoutListChanged.subscribe((workouts) => {
      this.userWorkouts = workouts;
    });

    this.activeWorkoutId = localStorage.getItem('activeWorkoutId') || '';
  }

  get sortedWorkouts(): WorkoutPlan[] {
    return this.userWorkouts.slice().sort((a, b) => {
      if (a.id === this.activeWorkoutId) return -1;
      if (b.id === this.activeWorkoutId) return 1;
      return 0;
    });
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

  onActionSelect(event: Event, workout: WorkoutPlan) {
    const selectedElement = event.target as HTMLSelectElement;
    const value = selectedElement.value;

    switch (value) {
      case 'edit':
        this.router.navigate(['workouts', workout.id, 'edit']);
        break;
      case 'delete':
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '300px',
          data: { message: 'Are you sure you want to delete this workout?' },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.deleteWorkout(workout.id);
          }
        });
        break;
      case 'activate':
        this.activateWorkout(workout.id);
        break;
      case 'deactivate':
        this.deactivateWorkout(workout.id);
        break;
    }

    // ✅ Reset the select after other actions
    selectedElement.selectedIndex = 0;
  }
}
