import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './workout-list.component.html',
  styleUrl: '../workout.component.css',
})
export class WorkoutListComponent implements OnInit {
  user: any;
  userWorkouts: any[] = [];
  isLoading = true;
  selectedRoutine: any = null;
  selectedDay: string = '';
  exerciseName: string = '';

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.supabaseService.currentUser.subscribe((user) => {
      this.user = user;
      this.isLoading = false;
      if (this.user) {
        this.getUserWorkouts();
      }
    });
  }

  // Get user workouts
  async getUserWorkouts() {
    if (this.user) {
      try {
        const workouts = await this.supabaseService.getUserWorkouts(
          this.user.id
        );
        this.userWorkouts = workouts;
      } catch (error) {
        console.error('Error fetching user workouts:', error);
      }
    }
  }

  openExerciseForm(workout: any, day: string) {
    this.selectedRoutine = workout;
    this.selectedDay = day;
    this.exerciseName = '';
  }

  addExercise() {
    // Save the exercise for this.selectedRoutine and this.selectedDay
    // You’ll need to decide how to store this (maybe in your DB or local state)
    console.log(
      `Add "${this.exerciseName}" to ${this.selectedRoutine.name} on ${this.selectedDay}`
    );
    // After saving:
    this.selectedRoutine = null;
    this.selectedDay = '';
    this.exerciseName = '';
  }

  cancelExercise() {
    this.selectedRoutine = null;
    this.selectedDay = '';
    this.exerciseName = '';
  }
}
