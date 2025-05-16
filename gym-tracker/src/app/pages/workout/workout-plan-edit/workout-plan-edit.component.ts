import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormsModule,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-workout-edit',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './workout-plan-edit.component.html',
  styleUrl: '../workout.component.css',
})
export class WorkoutEditComponent implements OnInit {
  workoutForm: FormGroup;
  user: any;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  days = [
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
    private router: Router
  ) {
    this.workoutForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      days: [this.selectedDays], // Bind selectedDays to the form
    });
  }

  ngOnInit(): void {
    this.supabaseService.currentUser.subscribe((user) => {
      this.user = user;
      this.isLoading = false;
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
      const { name, description, days } = this.workoutForm.value;
      try {
        await this.supabaseService.addRoutine({
          user_id: this.user.id,
          title: name,
          description: description,
          days: days, // Include selected days in the submission
        });
        this.successMessage = 'Workout added successfully!';
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Error adding workout:', error);
        this.errorMessage = 'Error adding workout. Please try again.';
      }
    }
  }
}
