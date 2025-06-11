import { Injectable } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  userWorkouts = [];
  userExercises = [];
  workoutListChanged = new BehaviorSubject<any[]>([]);
  exerciseListChanged = new BehaviorSubject<any[]>([]);
  progressListChanged = new BehaviorSubject<any[]>([]);
  exerciseProgressChanged = new BehaviorSubject<any[]>([]);
  private _workoutsCompleted = new BehaviorSubject<number>(0);
  workoutsCompleted$ = this._workoutsCompleted.asObservable();

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
      return workout;
    } catch (error) {
      console.error('Error fetching workout by ID:', error);
      return null;
    }
  }

  async getDayId(workoutId: string, day: string) {
    try {
      const dayId = await this.supabaseService.getDayId(workoutId, day);
      return dayId;
    } catch (error) {
      console.error('Error fetching day ID:', error);
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

  async getUserExercises(userId: string) {
    try {
      const exercises = await this.supabaseService.getUserExercises(userId);
      this.exerciseListChanged.next(exercises); // emit here
      return exercises;
    } catch (error) {
      console.error('Error fetching user exercises:', error);
      this.exerciseListChanged.next([]);
      return [];
    }
  }

  async getExerciseById(exerciseId: string) {
    try {
      const exercise = await this.supabaseService.getExerciseById(exerciseId);
      return exercise;
    } catch (error) {
      console.error('Error fetching exercise by ID:', error);
      return null;
    }
  }

  async getWorkoutProgress(userId: string, workoutId: string) {
    try {
      const progress = await this.supabaseService.getWorkoutProgress(
        userId,
        workoutId
      );
      this.progressListChanged.next(progress ?? []); // emit here
      return progress;
    } catch (error) {
      console.error('Error fetching workout progress:', error);
      this.progressListChanged.next([]);
      return null;
    }
  }

  async getExerciseProgress(userId: string, exerciseId: string) {
    try {
      const progress = await this.supabaseService.getExerciseProgress(
        userId,
        exerciseId
      );
      this.exerciseProgressChanged.next(progress ?? []); // emit here
      return progress;
    } catch (error) {
      console.error('Error fetching exercise progress:', error);
      this.exerciseProgressChanged.next([]);
      return null;
    }
  }

  /***** Create Methods *****/
  async addWorkoutPlan(plan: {
    user_id: string;
    title: string;
    description: string;
    days: string[];
  }) {
    try {
      const workout = await this.supabaseService.addWorkoutPlan(plan);
      await this.getUserWorkoutPlans(plan.user_id); // Refresh the list after adding
      return workout;
    } catch (error) {
      console.error('Error adding workout plan:', error);
      this.workoutListChanged.next([]);
      return null;
    }
  }

  async addExerciseToWorkoutDay(exercise: {
    user_id: string;
    day_id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    notes: string;
  }) {
    try {
      const addedExercise = await this.supabaseService.addExerciseToWorkoutDay(
        exercise
      );
      await this.getRoutineById(exercise.day_id); // Refresh the list after adding
      return addedExercise;
    } catch (error) {
      console.error('Error adding exercise to workout day:', error);
      this.exerciseListChanged.next([]);
      return null;
    }
  }

  async saveWorkoutProgress(
    userId: string,
    workoutId: string,
    exerciseId: string,
    dayId: string,
    progress: {
      name: string;
      sets: number;
      reps: number[];
      weights: number[];
      notes?: string[];
    }
  ) {
    try {
      const savedProgress = await this.supabaseService.saveWorkoutProgress(
        userId,
        workoutId,
        exerciseId,
        dayId,
        progress
      );
      return savedProgress;
    } catch (error) {
      console.error('Error saving workout progress:', error);
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
      await this.getUserWorkoutPlans(plan.user_id); // Refresh the list after updating
      return updatedWorkout;
    } catch (error) {
      console.error('Error updating workout by ID:', error);
      this.workoutListChanged.next([]);
      return null;
    }
  }

  async updateExercisePlanById(exercise: {
    dayId: string;
    userId: string;
    exerciseId: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    notes?: string;
  }) {
    try {
      const updatedExercise = await this.supabaseService.updateExercisePlanById(
        exercise
      );
      await this.getRoutineById(exercise.dayId); // Refresh the list after updating
      return updatedExercise;
    } catch (error) {
      console.error('Error updating exercise by ID:', error);
      this.exerciseListChanged.next([]);
      return null;
    }
  }

  /***** Delete Methods *****/
  async deleteWorkout(userId: string, workoutId: string) {
    try {
      const deletedWorkout = await this.supabaseService.deleteWorkout(
        workoutId
      );
      this.getUserWorkoutPlans(userId); // Refresh the list after deletion
      return deletedWorkout;
    } catch (error) {
      console.error('Error deleting workout:', error);
      this.workoutListChanged.next([]);
      return null;
    }
  }

  async deleteExercise(exerciseId: string, userId: string) {
    try {
      const deletedExercise = await this.supabaseService.deleteExercise(
        exerciseId
      );
      this.getRoutineById(userId); // Clear the list after deletion
      return deletedExercise;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      this.exerciseListChanged.next([]);
      return null;
    }
  }

  setWorkoutsCompleted(count: number) {
    this._workoutsCompleted.next(count);
  }
}
