import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class WorkoutListComponent implements OnInit, OnDestroy {
  user!: User;
  userWorkouts: WorkoutPlan[] = [];
  activeWorkoutId: string = '';
  showActions: boolean = false; // Flag to control visibility of action buttons

  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private supaBaseService: SupabaseService,
    private workoutService: WorkoutService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.supaBaseService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.user = user;

        if (this.user) {
          this.workoutService.getUserWorkoutPlans(this.user.id);
        }
      });

    this.workoutService.workoutListChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe((workouts) => {
        this.userWorkouts = workouts;
      });

    this.activeWorkoutId = localStorage.getItem('activeWorkoutId') || '';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Returns the list of workouts sorted by the active workout.
   * The active workout is always placed at the top of the list.
   * * @returns {WorkoutPlan[]} - Sorted list of workout plans.
   */
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

  /**
   * Deactivates the current active workout by removing it from local storage.
   * If the provided workout ID matches the active workout ID, it clears the active workout.
   * @param {string} workoutId - The ID of the workout plan to deactivate.
   */
  deactivateWorkout(workoutId: string) {
    if (this.activeWorkoutId === workoutId) {
      this.activeWorkoutId = '';
      localStorage.removeItem('activeWorkoutId');
    }
  }

  /**
   * Deletes a workout plan by its ID.
   * @param {string} workoutId - The ID of the workout plan to delete.
   */
  deleteWorkout(workoutId: string) {
    this.workoutService.deleteWorkout(this.user.id, workoutId);
    this.router.navigate(['/workouts']);
  }

  /**
   * Handles the selection of an action from the dropdown menu.
   * Depending on the selected action, it navigates to the edit page,
   * opens a confirmation dialog for deletion, or activates/deactivates the workout.
   * @param event - The event triggered by the action selection.
   * @param workout - The workout plan associated with the selected action.
   * @returns {void}
   */
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

    selectedElement.selectedIndex = 0;
  }
}
