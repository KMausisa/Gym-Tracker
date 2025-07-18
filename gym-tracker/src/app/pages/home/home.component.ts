import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SupabaseService } from '../../services/supabase.service';
import { WorkoutService } from '../workout/workout.service';

import { User } from '../profile/user.model';
import { WorkoutPlan } from '../../models/workout_plan.model';
import { Exercise } from '../../models/exercise.model';
import { ExerciseProgress } from '../../models/exercise_progress.model';

import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { SkipWorkoutDialogComponent } from '../../shared/skip-workout-dialog/skip-workout-dialog.component';

import {
  FormGroup,
  FormsModule,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnDestroy {
  user!: User;
  activeWorkout!: WorkoutPlan | null;
  activeWorkoutId: string = '';
  dataLoaded: boolean = false;

  currentDay: string = '';
  currentDayId: string = '';
  todaysExercises: Exercise[] = [];

  exerciseProgressForm!: FormGroup;

  currentExerciseIndex: number = 0;
  inWorkout: boolean = false;
  workoutCompleted: boolean = false;
  workoutsCompletedCount: number = 0;

  showSkipModal = false;
  skipReason: string = '';
  workoutSkipped: boolean = false;

  exerciseProgress: {
    [exerciseId: string]: {
      sets: number;
      reps: number[];
      weight: number[];
      notes: string[];
    };
  } = {};

  workoutDayHeader: string = 'This is your routine for the day:';

  private destroy$ = new Subject<void>();

  constructor(
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.supabaseService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (user) => {
        this.user = user;

        this.workoutsCompletedCount =
          await this.workoutService.getUserWorkoutCount(this.user.id);
      });

    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const today = new Date();
    const todayDate = new Date().toLocaleDateString('en-CA');
    this.currentDay = daysOfWeek[today.getDay()];
    this.activeWorkoutId = localStorage.getItem('activeWorkoutId') ?? '';

    const completedRaw = localStorage.getItem('completedWorkout');
    if (completedRaw && this.activeWorkoutId) {
      const completed = JSON.parse(completedRaw);
      console.log(completed);

      // Check if current workout ID is in the completed object and
      // if the current day is included for that workout.
      const completedDaysForWorkout = completed[this.activeWorkoutId] || [];
      this.workoutCompleted = completedDaysForWorkout.includes(todayDate);
    } else {
      // If no completed workout data exists or no active workout ID, reset state
      this.workoutCompleted = false;
    }

    this.skipReason = localStorage.getItem('skipReason') ?? '';

    const skippedRaw = localStorage.getItem('skippedWorkout');
    if (skippedRaw) {
      // Parse the skipped workout data
      // and check if it matches the current workout and day.
      const skipped = JSON.parse(skippedRaw);
      this.workoutSkipped =
        skipped.workoutId === this.activeWorkoutId &&
        skipped.day === this.currentDay;
      this.skipReason = skipped.reason || '';
    } else {
      // Reset skipped state if no skipped workout data exists
      this.workoutSkipped = false;
      this.skipReason = '';
    }

    if (this.activeWorkoutId) {
      this.workoutService
        .getWorkoutPlanById(this.activeWorkoutId)
        .then((workout) => {
          this.activeWorkout = workout;
        });
      this.getExercisesForDay(this.activeWorkoutId, this.currentDay);
    }

    this.dataLoaded = true;
  }

  /**
   * Fetches exercises for the current day based on the active workout ID.
   * @param activeWorkoutId - The ID of the active workout plan.
   * @param currentDay - The current day of the week.
   */
  async getExercisesForDay(activeWorkoutId: string, currentDay: string) {
    try {
      this.currentDayId = await this.workoutService.getDayId(
        activeWorkoutId,
        currentDay
      );
      console.log(this.currentDayId);
      if (!this.currentDayId) {
        this.workoutDayHeader = 'You have no exercises for today.';
        return;
      }
      this.todaysExercises = await this.workoutService.getRoutineById(
        this.currentDayId
      );
      if (this.todaysExercises.length === 0) {
        this.workoutDayHeader = 'You have no exercises for today.';
      }
    } catch (error) {
      console.error('Error fetching exercises for day:', error);
    }
  }

  /**
   * Confirms if the user wants to cancel the workout.
   * Opens a confirmation dialog and resets the workout state if confirmed.
   */
  confirmCancelWorkout() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to cancel your workout?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Reset workout state
        this.inWorkout = false;
        this.router.navigate(['/dashboard']);
      }
    });
  }

  /**
   * Starts the workout by initializing the first exercise and setting the workout state.
   */
  startWorkout() {
    if (this.todaysExercises && this.todaysExercises.length > 0) {
      this.inWorkout = true;
      this.currentExerciseIndex = 0;
      // Initialize progress for each exercise
      this.todaysExercises.forEach((ex) => {
        if (typeof ex.id === 'string' && ex.id) {
          if (!this.exerciseProgress[ex.id]) {
            this.exerciseProgress[ex.id] = {
              sets: ex.sets,
              reps: Array(ex.sets).fill(0),
              weight: Array(ex.sets).fill(0),
              notes: Array(ex.sets).fill(''),
            };
          }
        } else {
          console.warn('Exercise has undefined or non-string id:', ex);
        }
      });
      this.initExerciseProgressForm(
        this.todaysExercises[this.currentExerciseIndex]
      );
    } else {
      console.error('No exercises for today.');
    }
  }

  /**
   * Initializes the exercise progress form for the current exercise.
   * @param exercise - The current exercise to track progress for.
   */
  initExerciseProgressForm(exercise: Exercise) {
    this.exerciseProgressForm = this.fb.group({
      sets: this.fb.array(
        Array(exercise.sets)
          .fill(null)
          .map(() =>
            this.fb.group({
              reps: [0, Validators.required],
              weight: [0, Validators.required],
              notes: [''],
            })
          )
      ),
    });
  }

  /**
   * Moves to the next exercise in the workout.
   * If there are no more exercises, finishes the workout.
   */
  nextExercise() {
    if (
      this.todaysExercises &&
      this.currentExerciseIndex < this.todaysExercises.length - 1
    ) {
      this.currentExerciseIndex++;
      this.initExerciseProgressForm(
        this.todaysExercises[this.currentExerciseIndex]
      );
    } else {
      this.inWorkout = false;
      this.finishWorkout();
    }
  }

  /**
   * Finishes the workout by saving the progress for each exercise.
   * Sends the exercise progress to the backend/database.
   */
  finishWorkout() {
    for (const exerciseId in this.exerciseProgress) {
      const progress = this.exerciseProgress[exerciseId];
      const currentExercise = this.todaysExercises.find(
        (ex) => ex.id === exerciseId
      );
      if (currentExercise) {
        const progressToSave: Omit<ExerciseProgress, 'id'> = {
          exercise_id: exerciseId,
          user_id: this.user.id,
          workout_id: this.activeWorkout ? this.activeWorkout.id : '',
          day_id: currentExercise.day_id,
          name: currentExercise.name,
          sets: progress.sets,
          reps: progress.reps,
          weights: progress.weight,
          maxVolume: 0,
          notes: progress.notes,
          note: this.skipReason,
        };
        this.workoutService
          .saveWorkoutProgress(progressToSave)
          .catch((error) => {
            console.error('Error saving workout progress:', error);
          });
      } else {
        console.error(
          'Current exercise is undefined for exerciseId:',
          exerciseId
        );
      }
    }
  }

  onNextExercise() {
    this.onSubmit(); // Save current form data
    this.nextExercise(); // Move to next exercise
  }

  /**
   * Handles the finish workout action.
   * Saves the current form data, finishes the workout, and updates the completed status.
   */
  async onFinishWorkout() {
    await this.onSubmit(); // Save current form data
    await this.finishWorkout(); // Finish the workout
    this.inWorkout = false; // Reset workout state

    // Get existing completed data or initialize empty object
    const completedRaw = localStorage.getItem('completedWorkout');
    let completed = completedRaw ? JSON.parse(completedRaw) : {};

    // Initialize the array for this workout if it doesn't exist
    if (!completed[this.activeWorkoutId]) {
      completed[this.activeWorkoutId] = [];
    }

    const today = new Date();
    const todayDate = new Date().toLocaleDateString('en-CA');
    // Add current day if not already recorded
    if (!completed[this.activeWorkoutId].includes(todayDate)) {
      completed[this.activeWorkoutId].push(todayDate);
    }

    localStorage.setItem('completedWorkout', JSON.stringify(completed));

    this.workoutCompleted = true;
    this.workoutsCompletedCount++;
    this.workoutService.updateTotalWorkoutCount(
      this.user.id,
      this.workoutsCompletedCount
    );
  }

  /**
   * Submits the current exercise progress form.
   * Saves the progress for the current exercise and updates the exerciseProgress object.
   */
  onSubmit() {
    const formValue = this.exerciseProgressForm.value;
    const currentExercise = this.todaysExercises[this.currentExerciseIndex];
    if (currentExercise && typeof currentExercise.id === 'string') {
      this.exerciseProgress[currentExercise.id] = {
        sets: currentExercise.sets,
        reps: formValue.sets.map((set: any) => set.reps),
        weight: formValue.sets.map((set: any) => set.weight),
        notes: formValue.sets.map((set: any) => set.notes),
      };
    } else {
      console.warn('Current exercise or its id is undefined:', currentExercise);
    }
  }

  /**
   * Opens the skip workout dialog.
   * If the user confirms, logs the skipped workout with the reason and resets the workout state.
   */
  openSkipDialog() {
    const dialogRef = this.dialog.open(SkipWorkoutDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (reason !== undefined) {
        // Log skipped workout with reason
        if (this.todaysExercises && this.todaysExercises.length > 0) {
          // Initialize progress for each exercise
          this.todaysExercises.forEach((ex) => {
            if (typeof ex.id === 'string' && ex.id) {
              if (!this.exerciseProgress[ex.id]) {
                this.exerciseProgress[ex.id] = {
                  sets: ex.sets,
                  reps: Array(ex.sets).fill(0),
                  weight: Array(ex.sets).fill(0),
                  notes: Array(ex.sets).fill(''),
                };
              }
            } else {
              console.warn('Exercise has undefined or non-string id:', ex);
            }
          });

          this.skipReason = reason;
          this.workoutSkipped = true;
          this.finishWorkout();
          localStorage.setItem(
            'skippedWorkout',
            JSON.stringify({
              workoutId: this.activeWorkoutId,
              day: this.currentDay,
              reason: this.skipReason,
            })
          );
        } else {
          console.error('No exercises for today.');
        }
      }
    });
  }

  /**
   * Resets the workout progress state.
   * Clears the current exercise index, exercise progress, and other related states.
   */
  resetWorkoutProgress() {
    this.inWorkout = false;
    this.currentExerciseIndex = 0;
    this.exerciseProgress = {};
    this.exerciseProgressForm = this.fb.group({});
    this.skipReason = '';
    this.workoutSkipped = false;
  }

  get sets() {
    return this.exerciseProgressForm.get('sets') as FormArray;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
