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

  /***** Get Methods *****/
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

  async getWorkoutPlanById(workoutId: string) {
    try {
      const workout = await this.supabaseService.getWorkoutById(workoutId);
      this.workoutListChanged.next(workout); // emit here
      return workout;
    } catch (error) {
      console.error('Error fetching workout by ID:', error);
      this.workoutListChanged.next([]);
      return null;
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

  /***** Update Methods *****/
  async updateWorkoutPlanById(plan: {
    user_id: string;
    workout_id: string;
    title: string;
    description: string;
    days: string[];
  }) {
    try {
      const updatedWorkout = await this.supabaseService.updatePlan({
        user_id: plan.user_id,
        id: plan.workout_id,
        title: plan.title,
        description: plan.description,
        days: plan.days,
      });
      this.workoutListChanged.next(updatedWorkout); // emit here
      return updatedWorkout;
    } catch (error) {
      console.error('Error updating workout by ID:', error);
      this.workoutListChanged.next([]);
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
