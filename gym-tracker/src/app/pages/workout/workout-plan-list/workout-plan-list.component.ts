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

  deleteWorkout(workoutId: string) {}
}
