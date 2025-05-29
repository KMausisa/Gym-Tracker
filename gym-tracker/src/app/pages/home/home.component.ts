import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupabaseService } from '../../services/supabase.service';
import { WorkoutService } from '../workout/workout.service';

import { User } from '../profile/user.model';
import { Workout } from '../workout/workout.model';
import { Exercise } from '../workout/exercise.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  user!: User;
  activeWorkout!: Workout;

  currentDay: string = '';
  todaysExercises: Exercise[] = []; // Array to hold today's exercises

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
    private workoutService: WorkoutService
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
          console.log('Active Workout:', this.activeWorkout);
        });

      // Fetch the workout routine for the current day
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
    } else {
      console.error('No exercises for today.');
    }
  }

  nextExercise() {
    if (
      this.todaysExercises &&
      this.currentExerciseIndex < this.todaysExercises.length - 1
    ) {
      this.currentExerciseIndex++;
    } else {
      this.inWorkout = false;
      // Optionally, save progress or show a summary
      console.log('Workout complete!', this.exerciseProgress);
    }
  }

  finishWorkout() {}
}
