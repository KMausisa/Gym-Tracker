import { ActivatedRoute, Router, Params } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { Exercise } from '../exercise.model';

@Component({
  selector: 'app-workout-day-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workout-day-edit.component.html',
  styleUrl: './workout-day-edit.component.css',
})
export class WorkoutDayEditComponent {
  user!: User;
  exerciseForm: FormGroup;
  workoutId: string = '';
  exerciseId: string = '';
  originalExercise!: Exercise;
  selectedDay: string = '';
  DayId: string = '';
  isLoading: boolean = true;
  editMode: boolean = false;
  formHeading: string = 'Add Exercise'; // Default heading for the form
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.exerciseForm = this.fb.group({
      exerciseName: ['', Validators.required],
      sets: [0, [Validators.required, Validators.min(1)]],
      reps: [0, [Validators.required, Validators.min(1)]],
      weight: [0, [Validators.required, Validators.min(1)]],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.supabaseService.currentUser.subscribe((user) => {
      this.user = user;
      this.isLoading = false;
    });

    combineLatest([this.route.parent!.params, this.route.params]).subscribe(
      async ([parentParams, childParams]) => {
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
      }
    );
  }

  async onSubmit() {
    if (this.exerciseForm.valid) {
      let { exerciseName, sets, reps, weight, notes } = this.exerciseForm.value;

      this.DayId = await this.supabaseService.getDayId(
        this.workoutId,
        this.selectedDay
      );

      console.log('DayId:', this.DayId);

      // Call the Supabase function to add the exercise
      try {
        if (this.editMode == false) {
          await this.workoutService.addExerciseToWorkoutDay({
            user_id: this.user.id,
            day_id: this.DayId,
            name: exerciseName,
            sets: sets,
            reps: reps,
            weight: weight,
            notes: notes,
          });
          this.successMessage = 'Exercise added successfully!';
          this.router.navigate(['/workouts', this.workoutId, this.selectedDay]);
        } else {
          await this.workoutService.updateExercisePlanById({
            dayId: this.DayId,
            userId: this.user.id,
            exerciseId: this.exerciseId,
            name: exerciseName,
            sets: sets,
            reps: reps,
            weight: weight,
            notes: notes,
          });
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
