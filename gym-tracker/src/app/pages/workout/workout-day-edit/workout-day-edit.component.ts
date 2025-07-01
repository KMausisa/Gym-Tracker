import { ActivatedRoute, Router, Params } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  FormsModule,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { combineLatest } from 'rxjs';

import { WorkoutService } from '../workout.service';
import { SupabaseService } from '../../../services/supabase.service';
import { User } from '../../profile/user.model';
import { Exercise } from '../../../models/exercise.model';

@Component({
  selector: 'app-workout-day-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './workout-day-edit.component.html',
  styleUrl: './workout-day-edit.component.css',
})
export class WorkoutDayEditComponent implements OnInit, OnDestroy {
  user!: User;
  exerciseForm: FormGroup;
  workoutId: string = '';
  exerciseId: string = '';
  originalExercise!: Exercise | null;
  selectedDay: string = '';
  DayId: string = '';
  isLoading: boolean = true;
  editMode: boolean = false;
  formHeading: string = 'Add Exercise'; // Default heading for the form
  errorMessage = '';
  successMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.exerciseForm = this.fb.group({
      exerciseName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      sets: [0, [Validators.required, Validators.min(1)]],
      reps: [0, [Validators.required, Validators.min(1)]],
      weight: [0, [Validators.required, Validators.min(0)]],
      notes: ['', [Validators.maxLength(200)]],
    });
  }

  ngOnInit(): void {
    this.supabaseService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.user = user;
        this.isLoading = false;
      });

    combineLatest([this.route.parent!.params, this.route.params])
      .pipe(takeUntil(this.destroy$))
      .subscribe(async ([parentParams, childParams]) => {
        this.workoutId = parentParams['id'];
        this.selectedDay = parentParams['day'];
        this.exerciseId = childParams['exerciseId'];

        if (!this.workoutId || !this.selectedDay) {
          console.error(
            'Workout ID or Day is missing in the route parameters.'
          );
          return;
        }

        if (!this.exerciseId) {
          this.editMode = false;
          this.formHeading = 'Add Exercise';
          return;
        }

        this.originalExercise = await this.workoutService.getExerciseById(
          this.exerciseId
        );
        if (!this.originalExercise) {
          console.error('Exercise not found:', this.exerciseId);
          return;
        }
        this.editMode = true;
        this.formHeading = 'Edit Exercise';
        this.exerciseForm.patchValue({
          exerciseName: this.originalExercise.name,
          sets: this.originalExercise.sets,
          reps: this.originalExercise.reps,
          weight: this.originalExercise.weight,
          notes: this.originalExercise.notes || '',
        });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onSubmit() {
    if (this.exerciseForm.valid) {
      let { exerciseName, sets, reps, weight, notes } = this.exerciseForm.value;

      this.DayId = await this.supabaseService.getDayId(
        this.workoutId,
        this.selectedDay
      );

      const exerciseToAdd: Omit<Exercise, 'id' | 'created_at'> = {
        user_id: this.user.id,
        day_id: this.DayId,
        name: exerciseName,
        sets: sets,
        reps: reps,
        weight: weight,
        notes: notes,
      };

      const exerciseToUpdate: Exercise = {
        id: this.exerciseId,
        user_id: this.user.id,
        day_id: this.DayId,
        name: exerciseName,
        sets: sets,
        reps: reps,
        weight: weight,
        notes: notes,
      };

      try {
        if (this.editMode == false) {
          await this.workoutService.addExerciseToWorkoutDay(exerciseToAdd);
          this.successMessage = 'Exercise added successfully!';
          this.router.navigate(['/workouts', this.workoutId, this.selectedDay]);
        } else if (this.editMode == true) {
          await this.workoutService.updateExercisePlanById(exerciseToUpdate);
          this.successMessage = 'Exercise updated successfully!';
          this.router.navigate(['/workouts', this.workoutId, this.selectedDay]);
        }
      } catch (error) {
        console.error('Error adding exercise:', error);
        this.errorMessage = 'Error adding workout. Please try again.';
      }
    }
  }
}
