import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupabaseService } from '../../services/supabase.service';
import { WorkoutService } from '../workout/workout.service';

import { User } from '../profile/user.model';
import { Workout } from '../workout/workout.model';
import { Exercise } from '../workout/exercise.model';
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  user!: User;
  activeWorkout!: Workout;

  currentDay: string = '';
  todaysExercises: Exercise[] = []; // Array to hold today's exercises

  exerciseProgressForm!: FormGroup;

  currentExerciseIndex: number = 0;
  inWorkout: boolean = false;
  exerciseProgress: {
    [exerciseId: string]: {
      sets: number;
      reps: number[];
      weight: number[];
      notes: string[];
    };
  } = {};

  constructor(
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.supabaseService.currentUser.subscribe(async (user) => {
      this.user = user;
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

    const activeWorkoutId = localStorage.getItem('activeWorkoutId');

    if (activeWorkoutId) {
      // Fetch the active workout plan
      this.workoutService
        .getWorkoutPlanById(activeWorkoutId)
        .then((workout) => {
          this.activeWorkout = workout;
        });

      // Fetch and save the workout routine for the current day
      this.getExercisesForDay(activeWorkoutId, this.currentDay);
    }
  }

  getExercisesForDay(activeWorkoutId: string, currentDay: string) {
    this.workoutService
      .getDayId(activeWorkoutId, currentDay)
      .then((dayId) => {
        if (dayId) {
          this.workoutService.getRoutineById(dayId).then((exercises) => {
            this.todaysExercises = exercises ?? [];
            console.log(this.todaysExercises);
          });
        } else {
          console.log('No exercises found for', currentDay);
        }
      })
      .catch((error) => {
        console.error('Error fetching exercises for day:', error);
      });
  }

  startWorkout() {
    if (this.todaysExercises && this.todaysExercises.length > 0) {
      this.inWorkout = true;
      this.currentExerciseIndex = 0;
      // Initialize progress for each exercise
      this.todaysExercises.forEach((ex) => {
        if (!this.exerciseProgress[ex.id]) {
          this.exerciseProgress[ex.id] = {
            sets: ex.sets,
            reps: Array(ex.sets).fill(0), // User will enter actual reps
            weight: Array(ex.sets).fill(0), // User will enter actual weight
            notes: Array(ex.sets).fill(''), // User will enter notes
          };
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
      console.log(`Exercise ID: ${exerciseId}`, progress);
      console.log(`Current Exercise:`, currentExercise);
      if (currentExercise) {
        this.workoutService
          .saveWorkoutProgress(
            this.user.id,
            this.activeWorkout.id,
            exerciseId,
            {
              name: currentExercise.name,
              sets: progress.sets,
              reps: progress.reps,
              weights: progress.weight,
              notes: progress.notes,
            }
          )
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

  onFinishWorkout() {
    this.onSubmit(); // Save current form data
    this.finishWorkout(); // Finish the workout
  }

  get sets() {
    return this.exerciseProgressForm.get('sets') as FormArray;
  }

  onSubmit() {
    const formValue = this.exerciseProgressForm.value;
    const currentExercise = this.todaysExercises[this.currentExerciseIndex];
    this.exerciseProgress[currentExercise.id] = {
      sets: currentExercise.sets,
      reps: formValue.sets.map((set: any) => set.reps),
      weight: formValue.sets.map((set: any) => set.weight),
      notes: formValue.sets.map((set: any) => set.notes),
    };
  }
}
