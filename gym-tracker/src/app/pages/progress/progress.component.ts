import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgChart}

import { User } from '../profile/user.model';
import { SupabaseService } from '../../services/supabase.service';
import { WorkoutService } from '../workout/workout.service';

@Component({
  selector: 'app-progress',
  imports: [],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css',
})
export class ProgressComponent implements OnInit {
  user!: User;

  constructor(
    private supabaseService: SupabaseService,
    private workoutService: WorkoutService
  ) {}

  ngOnInit(): void {
    // Subscribe to the current user from the Supabase service
    this.supabaseService.currentUser.subscribe((user) => {
      this.user = user;

      if (this.user) {
        // Fetch user progress data here if needed
        this.workoutService.getWorkoutProgress(this.user.id);
        this.workoutService.progressListChanged.subscribe((progress) => {
          console.log('User Progress:', progress);
        });
      }
    });
  }
}
