import { Injectable, Output, EventEmitter } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  userWorkouts = [];
  @Output() workoutSelected = new EventEmitter<any>();
  @Output() workoutChanged = new EventEmitter<any>();
  workoutListChangedEvent = new Subject<any[]>();

  constructor(private supabaseService: SupabaseService) {}

  async getUserWorkoutPlans(userId: string) {
    try {
      const workouts = await this.supabaseService.getUserWorkouts(userId);
      this.workoutListChangedEvent.next(workouts); // emit here
      return workouts;
    } catch (error) {
      console.error('Error fetching user workouts:', error);
      this.workoutListChangedEvent.next([]);
      return [];
    }
  }
}
