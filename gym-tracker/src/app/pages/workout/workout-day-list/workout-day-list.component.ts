import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workout-day-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout-day-list.component.html',
  styleUrl: './workout-day-list.component.css',
})
export class WorkoutDayListComponent {
  @Input() selectedRoutine: any = null;
  @Input() selectedDay: string = '';
  exerciseName: string = '';

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
