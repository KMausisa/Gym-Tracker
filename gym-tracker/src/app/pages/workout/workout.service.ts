import { Injectable, Output, EventEmitter } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  userWorkouts = [];
  userExercises = [];
  workoutListChanged = new Subject<any>();
  exerciseListChanged = new Subject<any>();

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

  async getRoutineById(dayId: string) {
    try {
      const routine = await this.supabaseService.getRoutineById(dayId);
      this.exerciseListChanged.next(routine); // emit here
      return routine;
    } catch (error) {
      console.error('Error fetching workout by ID:', error);
      this.exerciseListChanged.next([]);
      return null;
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
