import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormsModule,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { WorkoutService } from '../workout.service';
import { SupabaseService } from '../../../services/supabase.service';
import { WorkoutPlan } from '../../../models/workout_plan.model';
import { User } from '../../profile/user.model';

@Component({
  selector: 'app-workout-edit',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './workout-plan-edit.component.html',
  styleUrl: './workout-plan-edit.component.css',
})
export class WorkoutEditComponent implements OnInit, OnDestroy {
  user!: User;

  workoutForm: FormGroup;
  originalWorkout!: WorkoutPlan | null;
  workoutId: string = '';

  editMode: boolean = false;
  isLoading = true;

  formHeading: string = 'Add Workout Plan';
  submitFormText: string = 'Create Workout';
  errorMessage = '';
  successMessage = '';

  selectedDays: string[] = [];
  daysOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize the form with validation rules
    this.workoutForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(50),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      days: [this.selectedDays, [Validators.required, Validators.minLength(1)]], // At least one day
    });
  }

  ngOnInit(): void {
    this.supabaseService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.user = user;
        this.isLoading = false;
      });

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (params) => {
        this.workoutId = params['id'];

        if (!this.workoutId) {
          this.editMode = false;
          return;
        }
        this.originalWorkout = await this.workoutService.getWorkoutPlanById(
          this.workoutId
        );
        if (!this.originalWorkout) {
          return;
        }
        this.editMode = true;

        // Change form heading and submit text for edit mode
        this.formHeading = 'Edit Workout Plan';
        this.submitFormText = 'Edit Workout';

        if (this.editMode && this.originalWorkout) {
          this.workoutForm.patchValue({
            name: this.originalWorkout.title,
            description: this.originalWorkout.description,
            days: this.originalWorkout.days,
          });
          this.selectedDays = [...this.originalWorkout.days];
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles the change event for day checkboxes.
   * Updates the selectedDays array and form control value based on checkbox state.
   * @param event - The change event from the checkbox input.
   */
  onDayChange(event: any) {
    const selectedDay = event.target.value;
    if (event.target.checked) {
      // Add the day to the selectedDays array
      this.selectedDays.push(selectedDay);
    } else {
      // Remove the day from the selectedDays array
      this.selectedDays = this.selectedDays.filter(
        (day) => day !== selectedDay
      );
    }
    // Update the form control value
    this.workoutForm.patchValue({ days: this.selectedDays });
    this.workoutForm.get('days')?.updateValueAndValidity();
    this.workoutForm.get('days')?.markAsTouched();
  }

  /**
   * Cancels the workout creation or editing.
   * Resets the form and navigates back to the workout list.
   */
  cancel() {
    this.workoutForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
    this.router.navigate(['/workouts']);
  }

  /**
   * Submits the workout form.
   * Validates the form, constructs the workout plan object, and either adds or updates it.
   * Displays success or error messages based on the operation outcome.
   */
  async onSubmit() {
    if (this.workoutForm.valid) {
      let { name, description, days } = this.workoutForm.value;
      days = [...days].sort(
        (a, b) => this.daysOrder.indexOf(a) - this.daysOrder.indexOf(b)
      );

      const workoutPlanToAdd: Omit<WorkoutPlan, 'id'> = {
        user_id: this.user.id,
        title: name,
        description: description,
        days: days,
      };

      const workoutPlanToUpdate: WorkoutPlan = {
        id: this.workoutId,
        user_id: this.user.id,
        title: name,
        description: description,
        days: days,
      };

      try {
        if (this.editMode == false) {
          // If not in edit mode, create a new workout
          await this.workoutService.addWorkoutPlan(workoutPlanToAdd);

          this.successMessage = 'Workout added successfully!';
          this.router.navigate(['/workouts']);
        } else {
          // If in edit mode, update the existing workout
          await this.workoutService.updateWorkoutPlanById(workoutPlanToUpdate);
          this.successMessage = 'Workout updated successfully!';
          this.router.navigate(['/workouts']);
        }
      } catch (error) {
        console.error('Error adding workout:', error);
        this.errorMessage = 'Error adding workout. Please try again.';
      }
    }
  }
}
