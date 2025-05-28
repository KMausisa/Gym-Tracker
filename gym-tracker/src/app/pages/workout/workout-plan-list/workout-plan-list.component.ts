import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { WorkoutService } from '../workout.service';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './workout-plan-list.component.html',
  styleUrl: './workout-plan-list.component.css',
})
export class WorkoutListComponent implements OnInit {
  user: any;
  userWorkouts: any[] = [];

  isLoading = true;
  selectedRoutine: any = null;
  selectedDay: string = '';
  exerciseName: string = '';

  constructor(
    private supaBaseService: SupabaseService,
    private workoutService: WorkoutService,
    private router: Router
  ) {}

  ngOnInit() {
    this.supaBaseService.currentUser.subscribe((user) => {
      this.user = user;
      this.isLoading = false;
    });

    this.workoutService.workoutListChanged.subscribe((workouts) => {
      this.userWorkouts = workouts;
    });
  }

  deleteWorkout(workoutId: string) {
    this.workoutService.deleteWorkout(this.user.id, workoutId);
    this.router.navigate(['/workouts']);
  }
}
