import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { Location } from '@angular/common';
import { filter, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  RouterModule,
  RouterOutlet,
  Router,
  NavigationEnd,
} from '@angular/router';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { WorkoutService } from '../workout.service';
import { SupabaseService } from '../../../services/supabase.service';
import { User } from '../../profile/user.model';
import { Exercise } from '../../../models/exercise.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-workout-day-list',
  standalone: true,
  imports: [FormsModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './workout-day-list.component.html',
  styleUrl: './workout-day-list.component.css',
})
export class WorkoutDayListComponent implements OnInit, OnDestroy {
  user!: User;

  workoutId: string = '';
  exercises: Exercise[] = [];

  dayId: string = '';
  selectedDay: string = '';

  isLoading: boolean = false;
  @Output() workoutSelected = new EventEmitter<any[]>();

  exerciseName: string = '';
  sets: number = 0;
  reps: number = 0;
  weight: number = 0;
  notes: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private workoutService: WorkoutService,
    private supabaseService: SupabaseService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.supabaseService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.user = user;
      });

    this.loadFromParams();

    // Listen for navigation events so you can reload exercises when this route is re-activated
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadFromParams();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads workout and day information from route parameters.
   * Fetches the day ID and exercises for the selected day.
   */
  async loadFromParams() {
    const params = this.route.snapshot.params;
    this.workoutId = params['id'];
    this.selectedDay = params['day'];

    this.dayId = await this.supabaseService.getDayId(
      this.workoutId,
      this.selectedDay
    );

    this.loadExercisesForDay(this.dayId);
  }

  selectWorkout(workout: any) {
    this.workoutSelected.emit(workout);
  }

  /**
   * Loads exercises for the specified workout day.
   * @param dayId - The ID of the workout day to load exercises for.
   * Fetches the routine for the specified day and updates the exercises list.
   */
  async loadExercisesForDay(dayId: string) {
    this.isLoading = true;
    this.exercises = []; // Reset to prevent flicker

    const routine = await this.workoutService.getRoutineById(dayId);

    // Only update exercises if routine was fetched
    this.exercises = routine ?? [];
    this.isLoading = false;
  }

  /**
   * Submits a new exercise to the workout service.
   * Validates the form, constructs the exercise object, and adds it to the workout.
   * @returns {Promise<void>} - Resolves when the exercise is added.
   * @throws {Error} If exercise submission fails, sets error message.
   */
  onDeleteExercise(exerciseId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to delete this exercise?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.workoutService
          .deleteExercise(exerciseId, this.user.id)
          .then(() => {
            this.loadExercisesForDay(this.dayId);
          });
        this.router.navigate([
          `/workouts/${this.workoutId}/${this.selectedDay}`,
        ]);
      }
    });
  }

  /**
   * Navigates back to the previous page or workout list.
   * If the current URL is for a specific workout day, it navigates to the workout list.
   * Otherwise, it uses the browser's back functionality.
   */
  goBack() {
    if (this.router.url === `/workouts/${this.workoutId}/${this.selectedDay}`) {
      this.router.navigate(['/workouts']);
    } else {
      this.location.back();
    }
  }

  /**
   * Checks if the current route is for adding a new workout or editing an existing one.
   * This is determined by checking if the URL ends with '/add' or includes '/edit'.
   * @returns {boolean} - True if on an add route, false otherwise.
   */
  get isOnAddRoute(): boolean {
    return this.router.url.endsWith('/add');
  }

  /**
   * Checks if the current route is for editing a workout.
   * This is determined by checking if the URL includes '/edit'.
   * @returns {boolean} - True if on an edit route, false otherwise.
   */
  get isOnEditRoute(): boolean {
    return this.router.url.includes('/edit');
  }
}
