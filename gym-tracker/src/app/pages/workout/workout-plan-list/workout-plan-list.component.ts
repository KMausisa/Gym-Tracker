import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { WorkoutService } from '../workout.service';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './workout-plan-list.component.html',
  styleUrl: '../workout.component.css',
})
export class WorkoutListComponent implements OnInit {
  user: any;
  userWorkouts: any[] = [];

  isLoading = true;
  selectedRoutine: any = null;
  selectedDay: string = '';
  exerciseName: string = '';

  constructor(private workoutService: WorkoutService) {}

  ngOnInit() {
    this.workoutService.workoutListChanged.subscribe((workouts) => {
      this.userWorkouts = workouts;
    });
  }

  openExerciseForm(workout: any, day: string) {
    this.selectedRoutine = workout;
    this.selectedDay = day;
    this.exerciseName = '';
    console.log(workout.id);
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
