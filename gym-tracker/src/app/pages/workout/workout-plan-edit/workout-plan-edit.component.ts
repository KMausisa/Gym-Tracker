import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-workout-edit',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './workout-plan-edit.component.html',
  styleUrl: '../workout.component.css',
})
export class WorkoutEditComponent implements OnInit {
  workoutForm: FormGroup;
  workoutId: string = '';
  originalWorkout: any;
  editMode: boolean = false;
  user: any;
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
    this.supabaseService.currentUser.subscribe((user) => {
      this.user = user;
      this.isLoading = false;
    });

    this.route.params.subscribe(async (params) => {
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
      if (this.editMode && this.originalWorkout) {
        this.workoutForm.patchValue({
          name: this.originalWorkout.title,
          description: this.originalWorkout.description,
          days: this.originalWorkout.days,
        });
        this.selectedDays = [...this.originalWorkout.days]; // <-- Add this line
      }
      console.log('Original Workout:', this.originalWorkout);
    });
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

  async onSubmit() {
    if (this.workoutForm.valid) {
      let { name, description, days } = this.workoutForm.value;
      days = [...days].sort(
        (a, b) => this.daysOrder.indexOf(a) - this.daysOrder.indexOf(b)
      );

      try {
        if (this.editMode == false) {
          // If not in edit mode, create a new workout
          await this.workoutService.addWorkoutPlan({
            user_id: this.user.id,
            title: name,
            description: description,
            days: days, // Include selected days in the submission
          });

          this.successMessage = 'Workout added successfully!';
          this.router.navigate(['/workouts']);
        } else {
          // If in edit mode, update the existing workout
          await this.workoutService.updateWorkoutPlanById({
            user_id: this.user.id,
            workout_id: this.workoutId,
            title: name,
            description: description,
            days: days, // Include selected days in the update
          });
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
