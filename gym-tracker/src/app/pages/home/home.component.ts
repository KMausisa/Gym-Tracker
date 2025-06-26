import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { SupabaseService } from '../../services/supabase.service';
import { WorkoutService } from '../workout/workout.service';

import { User } from '../profile/user.model';
import { WorkoutPlan } from '../../models/workout_plan.model';
import { Exercise } from '../../models/exercise.model';

import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

import {
  FormGroup,
  FormsModule,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { ExerciseProgress } from '../../models/exercise_progress.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  user!: User;
  activeWorkout!: WorkoutPlan | null;
  activeWorkoutId: string = '';

  currentDay: string = '';
  todaysExercises: Exercise[] = []; // Array to hold today's exercises

  exerciseProgressForm!: FormGroup;

  currentExerciseIndex: number = 0;
  inWorkout: boolean = false;
  workoutCompleted: boolean = false;
  workoutsCompletedCount: number = 0;

  exerciseProgress: {
    [exerciseId: string]: {
      sets: number;
      reps: number[];
      weight: number[];
      notes: string[];
    };
  } = {};

  workoutDayHeader: string = 'This is your routine for the day:';

  constructor(
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.supabaseService.currentUser.subscribe(async (user) => {
      this.user = user;

      this.workoutsCompletedCount =
        await this.workoutService.getUserWorkoutCount(this.user.id);

      console.log('Total workouts: ', this.workoutsCompletedCount);
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
    this.currentDay = daysOfWeek[today.getDay()];
    this.activeWorkoutId = localStorage.getItem('activeWorkoutId') ?? '';

    const completedRaw = localStorage.getItem('completedWorkout');
    if (completedRaw && this.activeWorkoutId) {
      const completed = JSON.parse(completedRaw);

      // Check if current workout ID is in the completed object and
      // if the current day is included for that workout.
      const completedDaysForWorkout = completed[this.activeWorkoutId] || [];

      this.workoutCompleted = completedDaysForWorkout.includes(this.currentDay);
    } else {
      this.workoutCompleted = false;
    }

    if (this.activeWorkoutId) {
      this.workoutService
        .getWorkoutPlanById(this.activeWorkoutId)
        .then((workout) => {
          this.activeWorkout = workout;
        });

      this.getExercisesForDay(this.activeWorkoutId, this.currentDay);
    }
  }

  getExercisesForDay(activeWorkoutId: string, currentDay: string) {
    this.workoutService
      .getDayId(this.activeWorkoutId ?? '', currentDay)
      .then((dayId) => {
        if (dayId) {
          this.workoutService.getRoutineById(dayId).then((exercises) => {
            this.todaysExercises = exercises ?? [];
            if (this.todaysExercises.length == 0) {
              this.workoutDayHeader = 'You have no exercises for today.';
            }
          });
        } else {
          console.log('No exercises found for', currentDay);
        }
      })
      .catch((error) => {
        console.error('Error fetching exercises for day:', error);
      });
  }

  confirmCancelWorkout() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to cancel your workout?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Reset state or navigate
        this.inWorkout = false;
        this.router.navigate(['/dashboard']); // or wherever is appropriate
      }
    });
  }

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
              reps: Array(ex.sets).fill(0), // User will enter actual reps
              weight: Array(ex.sets).fill(0), // User will enter actual weight
              notes: Array(ex.sets).fill(''), // User will enter notes
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
      this.finishWorkout(); // <-- Send all progress here
    }
  }

  finishWorkout() {
    // Send this.exerciseProgress to your backend/database here
    console.log('Finishing workout with progress:', this.exerciseProgress);
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
        };
        this.workoutService
          .saveWorkoutProgress(progressToSave)
          .then(() => {
            console.log('Workout progress saved!');
            // Optionally show a success message or redirect
          })
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

    // Add current day if not already recorded
    if (!completed[this.activeWorkoutId].includes(this.currentDay)) {
      completed[this.activeWorkoutId].push(this.currentDay);
    }

    localStorage.setItem('completedWorkout', JSON.stringify(completed));

    this.workoutCompleted = true;
    this.workoutsCompletedCount++;
    this.workoutService.updateTotalWorkoutCount(
      this.user.id,
      this.workoutsCompletedCount
    );
  }

  get sets() {
    return this.exerciseProgressForm.get('sets') as FormArray;
  }

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
}
