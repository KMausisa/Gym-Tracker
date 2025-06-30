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
  workoutForm: FormGroup;
  workoutId: string = '';
  originalWorkout!: WorkoutPlan | null;
  editMode: boolean = false;
  formHeading: string = 'Add Workout Plan'; // Default heading for the form
  submitFormText: string = 'Create Workout';
  user!: User;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  daysOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  selectedDays: string[] = []; // Array to store selected days

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.workoutForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      days: [this.selectedDays, Validators.required], // Bind selectedDays to the form
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
        this.formHeading = 'Edit Workout Plan'; // Change form heading for edit mode
        this.submitFormText = 'Edit Workout';
        if (this.editMode && this.originalWorkout) {
          this.workoutForm.patchValue({
            name: this.originalWorkout.title,
            description: this.originalWorkout.description,
            days: this.originalWorkout.days,
          });
          this.selectedDays = [...this.originalWorkout.days]; // <-- Add this line
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
  }

  cancel() {
    this.workoutForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
    this.router.navigate(['/workouts']);
  }

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
        days: days, // Include selected days in the submission
      };

      const workoutPlanToUpdate: WorkoutPlan = {
        id: this.workoutId,
        user_id: this.user.id,
        title: name,
        description: description,
        days: days, // Include selected days in the update
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
