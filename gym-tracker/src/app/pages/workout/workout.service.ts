import { Injectable, Output, EventEmitter } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  userWorkouts = [];
  workoutListChanged = new Subject<any>();

  constructor(private supabaseService: SupabaseService) {}

  async getUserWorkoutPlans(userId: string) {
    try {
      const workouts = await this.supabaseService.getUserWorkouts(userId);
      this.workoutListChanged.next(workouts); // emit here
      return workouts;
    } catch (error) {
      console.error('Error fetching user workouts:', error);
      this.workoutListChanged.next([]);
      return [];
    }
  }

  // Get workout by ID
  // async getRoutineById(workoutId: string) {
  //   try {
  //     const workout = await this.supabaseService.getRoutineById(workoutId);
  //     return workout;
  //   } catch (error) {
  //     console.error('Error fetching workout by ID:', error);
  //     return null;
  //   }
  // }
}
