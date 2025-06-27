import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';

import 'chartjs-adapter-date-fns';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { User } from '../profile/user.model';
import { SupabaseService } from '../../services/supabase.service';
import { WorkoutService } from '../workout/workout.service';
import { CommonModule } from '@angular/common';
import { Exercise } from '../../models/exercise.model';
import { ExerciseProgress } from '../../models/exercise_progress.model';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css',
})
export class ProgressComponent implements OnInit, OnDestroy {
  user!: User;
  userProgress: any[] = [];
  exerciseList: Exercise[] = [];
  top3Exercises: ExerciseProgress[] = [];
  heaviestLift: {
    exercise: string;
    weight: number;
    reps: number;
  } = {
    exercise: '',
    weight: 0,
    reps: 0,
  };

  workoutsCompletedCount: number = 0;
  activeWorkoutId: string = '';

  exerciseProgress: Exercise[] = [];
  filteredExercises: Exercise[] = [];

  term: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get the active workout id from local storage
    this.activeWorkoutId = localStorage.getItem('activeWorkoutId') || '';

    // Subscribe to workouts completed count
    // Subscribe to current user and fetch data
    this.supabaseService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.user = user;
        if (!this.user) return;

        // Fetch user exercises and workout progress
        this.workoutService.getUserWorkoutCount(this.user.id);
        this.workoutService.getUserExercises(this.user.id);
        this.workoutService.getWorkoutProgress(this.user.id);
      });

    // Listen for progress and exercise list changes
    this.workoutService.progressListChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe((progress) => {
        this.userProgress = progress;
        this.prepareData();
      });

    this.workoutService.exerciseListChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe((exerciseList) => {
        this.exerciseList = exerciseList;
      });

    this.workoutService.workoutsCompleted$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.workoutsCompletedCount = count;
      });
  }

  search(value: string) {
    this.term = value;
    if (value) {
      // Filter and deduplicate by exercise name (or use exercise_id if available)
      const seen = new Set();
      this.filteredExercises = this.exerciseList
        .filter((ex) => ex.name.toLowerCase().includes(value.toLowerCase()))
        .filter((ex) => {
          if (seen.has(ex.name)) return false;
          seen.add(ex.name);
          return true;
        });
    } else {
      this.filteredExercises = [];
    }
  }

  selectExercise(exercise: any) {
    // Do what you want with the selected exercise
    // For example, display its details or set the search box value
    this.term = exercise.name;
    this.filteredExercises = [];
    // Optionally, show exercise details somewhere
  }

  get isOnNewRoute() {
    let child = this.route.firstChild;
    return !!child && !!child.snapshot.paramMap.get('exerciseId');
  }

  async prepareData() {
    // find max volume for each exercise
    this.userProgress.forEach((exercise) => {
      exercise.maxVolume = Math.max(
        ...exercise.weights.map(
          (weight: number, index: number) =>
            weight * (exercise.reps[index] ?? 0)
        )
      );
    });
    // Grab the top 3 exercises by max volume
    this.userProgress.sort((a, b) => (b.maxVolume ?? 0) - (a.maxVolume ?? 0));
    this.top3Exercises = this.userProgress.slice(0, 3);

    // Find the heaviest lift in terms of weight (lbs)
    this.heaviestLift = this.userProgress.reduce(
      (max, exercise) => {
        const maxWeight = Math.max(...exercise.weights);
        if (maxWeight > max.weight) {
          return {
            exercise: exercise.name,
            weight: maxWeight,
            reps: exercise.reps[exercise.weights.indexOf(maxWeight)] || 0,
          };
        }
        return max;
      },
      { exercise: '', weight: 0, reps: 0 }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
