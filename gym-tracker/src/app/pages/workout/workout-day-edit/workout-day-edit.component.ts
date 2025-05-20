import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-workout-day-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workout-day-edit.component.html',
  styleUrl: './workout-day-edit.component.css',
})
export class WorkoutDayEditComponent {
  user: any;
  exerciseForm: FormGroup;
  workoutId: string = '';
  selectedDay: string = '';
  DayId: string = '';
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
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
    this.route.parent?.params.subscribe((params) => {
      this.workoutId = params['id'];
      this.selectedDay = params['day'];
    });

    this.supabaseService.currentUser.subscribe((user) => {
      this.user = user;
      this.isLoading = false;
    });
  }

  async onSubmit() {
    if (this.exerciseForm.valid) {
      const { exerciseName, sets, reps, weight, notes } =
        this.exerciseForm.value;

      this.DayId = await this.supabaseService.getDayId(
        this.workoutId,
        this.selectedDay
      );

      console.log('DayId:', this.DayId);

      // Call the Supabase function to add the exercise
      try {
        await this.supabaseService.addExerciseToWorkoutDay({
          day_id: this.DayId,
          name: exerciseName,
          sets: sets,
          reps: reps,
          weight: weight,
          notes: notes,
        });
        this.successMessage = 'Exercise added successfully!';
        this.router.navigate(['/workouts', this.workoutId, this.selectedDay]);
      } catch (error) {
        console.error('Error adding exercise:', error);
        this.errorMessage = 'Error adding workout. Please try again.';
      }
    }
  }
}
