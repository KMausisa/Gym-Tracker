import { Injectable } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { BehaviorSubject } from 'rxjs';

import { WorkoutPlan } from '../../models/workout_plan.model';
import { Exercise } from '../../models/exercise.model';
import { ExerciseProgress } from '../../models/exercise_progress.model';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  userWorkouts = [];
  userExercises = [];
  workoutListChanged = new BehaviorSubject<WorkoutPlan[]>([]);
  exerciseListChanged = new BehaviorSubject<Exercise[]>([]);
  progressListChanged = new BehaviorSubject<ExerciseProgress[]>([]);
  exerciseProgressChanged = new BehaviorSubject<ExerciseProgress[]>([]);
  private _workoutsCompleted = new BehaviorSubject<number>(0);
  workoutsCompleted$ = this._workoutsCompleted.asObservable();

  constructor(private supabaseService: SupabaseService) {}

  /***** GET METHODS *****/

  /**
   * Get the workout plans for a specific user.
   * This method fetches the workout plans from the Supabase service and emits the updated list.
   * @param userId - The ID of the user whose workout plans are to be fetched.
   * @returns {Promise<WorkoutPlan[] | null>}A promise that resolves to an array of WorkoutPlan objects or null if an error occurs.
   * @throws Error if there is an issue fetching the workout plans.
   */
  async getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[] | null> {
    try {
      const workouts = await this.supabaseService.getUserWorkouts(userId);
      this.workoutListChanged.next(workouts ?? []);
      return workouts;
    } catch (error) {
      console.error('Error fetching user workouts:', error);
      this.workoutListChanged.next([]);
      return [];
    }
  }

  async getUserWorkoutCount(userId: string): Promise<number> {
    try {
      const userWorkoutCount = await this.supabaseService.getTotalWorkoutCount(
        userId
      );
      this._workoutsCompleted.next(userWorkoutCount);
      return userWorkoutCount;
    } catch (error) {
      console.error("Error fetching User's total workout count: ", error);
      return 0;
    }
  }

  /**
   * Get a specific workout plan by its ID.
   * @param workoutId - The ID of the workout plan to be fetched.
   * @returns {Promise<WorkoutPlan | null>} A promise that resolves to a WorkoutPlan object or null if an error occurs.
   * @throws Error if there is an issue fetching the workout plan.
   */
  async getWorkoutPlanById(workoutId: string): Promise<WorkoutPlan | null> {
    try {
      const workout = await this.supabaseService.getWorkoutById(workoutId);
      return workout ?? null;
    } catch (error) {
      console.error('Error fetching workout by ID:', error);
      return null;
    }
  }

  /**
   * Gets the ID of a specific day in a workout plan.
   * @param workoutId - The ID of the workout plan.
   * @param day - The day for which the ID is to be fetched (e.g., 'Monday', 'Tuesday').
   * @returns {Promise<string | null>} A promise that resolves to the ID of the day or null if an error occurs.
   * @throws Error if there is an issue fetching the day ID.
   */
  async getDayId(workoutId: string, day: string): Promise<string | null> {
    try {
      const dayId = await this.supabaseService.getDayId(workoutId, day);
      return dayId;
    } catch (error) {
      console.error('Error fetching day ID:', error);
      return null;
    }
  }

  /**
   * Gets the routine (exercises) for a specific day in a workout plan.
   * This method fetches the routine for a given day ID and emits the updated exercise list.
   * @param dayId - The ID of the day for which the routine is to be fetched.
   * @returns {Promise<Exercise[] | null>} A promise that resolves to an array of Exercise objects or null if an error occurs.
   * @throws Error if there is an issue fetching the routine.
   */
  async getRoutineById(dayId: string): Promise<Exercise[] | null> {
    try {
      const routine = await this.supabaseService.getRoutineById(dayId);
      this.exerciseListChanged.next(routine ?? []);
      return routine;
    } catch (error) {
      console.error('Error fetching workout by ID:', error);
      this.exerciseListChanged.next([]);
      return null;
    }
  }

  /**
   * Gets the exercises for a specific user.
   * This method fetches the exercises from the Supabase service and emits the updated exercise list.
   * @param userId - The ID of the user whose exercises are to be fetched.
   * @returns - A promise that resolves to an array of Exercise objects or null if an error occurs.
   * @throws Error if there is an issue fetching the exercises.
   */
  async getUserExercises(userId: string): Promise<Exercise[] | null> {
    try {
      const exercises = await this.supabaseService.getUserExercises(userId);
      this.exerciseListChanged.next(exercises ?? []); // emit here
      return exercises;
    } catch (error) {
      console.error('Error fetching user exercises:', error);
      this.exerciseListChanged.next([]);
      return [];
    }
  }

  /**
   * Get a specific exercise by its ID.
   * This method fetches the exercise details from the Supabase service.
   * @param exerciseId - The ID of the exercise to be fetched.
   * @returns {Promise<Exercise | null>} A promise that resolves to an Exercise object or null if an error occurs.
   * @throws Error if there is an issue fetching the exercise.
   */
  async getExerciseById(exerciseId: string): Promise<Exercise | null> {
    try {
      const exercise = await this.supabaseService.getExerciseById(exerciseId);
      return exercise;
    } catch (error) {
      console.error('Error fetching exercise by ID:', error);
      return null;
    }
  }

  /**
   * Gets the workout progress for a specific user.
   * This method fetches the workout progress from the Supabase service and emits the updated progress list.
   * @param userId - The ID of the user whose workout progress is to be fetched.
   * @returns {Promise<ExerciseProgress[] | null>} A promise that resolves to an array of ExerciseProgress objects or null if an error occurs.
   * @throws Error if there is an issue fetching the workout progress.
   */
  async getWorkoutProgress(userId: string): Promise<ExerciseProgress[] | null> {
    try {
      const progress = await this.supabaseService.getWorkoutProgress(userId);
      this.progressListChanged.next(progress ?? []); // emit here
      return progress;
    } catch (error) {
      console.error('Error fetching workout progress:', error);
      this.progressListChanged.next([]);
      return null;
    }
  }

  /**
   * Gets the progress for a specific exercise of a user.
   * This method fetches the exercise progress from the Supabase service and emits the updated progress list.
   * @param userId - The ID of the user whose exercise progress is to be fetched.
   * @param exerciseId - The ID of the exercise for which progress is to be fetched.
   * @returns {Promise<ExerciseProgress[]>} A promise that resolves to an array of ExerciseProgress objects or null if an error occurs.
   * @throws Error if there is an issue fetching the exercise progress.
   */
  async getExerciseProgress(
    userId: string,
    exerciseId: string
  ): Promise<ExerciseProgress[]> {
    try {
      const progress = await this.supabaseService.getExerciseProgress(
        userId,
        exerciseId
      );
      this.exerciseProgressChanged.next(progress); // emit here
      return progress ?? [];
    } catch (error) {
      console.error('Error fetching exercise progress:', error);
      this.exerciseProgressChanged.next([]);
      return [];
    }
  }

  /***** ADD, CREATE, AND UPDATE METHODS *****/

  /**
   * Add Workout Plan based on User ID
   * @param workoutPlan - The workout plan the user input in the form.
   * @returns {Promise<WorkoutPlan[] | null>} Promise that resolves to the created workout plan or throws an error.
   * @throws Error is there is an issue adding the data or if no data is returned.
   */
  async addWorkoutPlan(
    workoutPlan: Omit<WorkoutPlan, 'id'>
  ): Promise<WorkoutPlan[] | null> {
    try {
      const workout = await this.supabaseService.addWorkoutPlan(workoutPlan);
      await this.getUserWorkoutPlans(workoutPlan.user_id); // Refresh the list after adding
      return workout;
    } catch (error) {
      console.error('Error adding workout plan:', error);
      this.workoutListChanged.next([]);
      return null;
    }
  }

  /**
   * Adds an exercise to a specific day in a User's Workout Plan.
   * @param exercise - The exercise object containing user_id, day_id, name, sets, reps, weight, and optional notes.
   * @returns {Exercise} Promise that resolves to the created exercise or throws an error.
   * @throws Error if there is an issue inserting the data or if no data is returned.
   */
  async addExerciseToWorkoutDay(
    exercise: Omit<Exercise, 'id'>
  ): Promise<Exercise | null> {
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

  /**
   * Save workout progress for a specific exercise
   * @param exerciseProgress - The exercise object containing user_id, day_id, name, and the users recorded sets, reps, weight, and optional notes.
   * @returns {ExerciseProgress} Promise that resolves to the created exercise progress or throws an error.
   * @throws Error if there is an issue inserting the data or if no data is returned.
   * */
  async saveWorkoutProgress(
    exerciseProgress: Omit<ExerciseProgress, 'id'>
  ): Promise<ExerciseProgress | null> {
    try {
      const savedProgress = await this.supabaseService.saveWorkoutProgress(
        exerciseProgress
      );

      return savedProgress;
    } catch (error) {
      console.error('Error saving workout progress:', error);
      return null;
    }
  }

  /**
   * Update the total workout count based on the user id.
   * @param userId - The id of the user
   * @param count  - The updated workout count
   * @throws Error if there is an issue updating the workout count.
   */
  async updateTotalWorkoutCount(userId: string, count: number) {
    try {
      await this.supabaseService.updateTotalWorkoutCount(userId, count);
      this._workoutsCompleted.next(count);
    } catch (error) {
      console.error('Error updating total workout count:', error);
    }
  }

  /**
   * Update the workout plan based on the id.
   * @param workoutPlan - The workout plan object containing id, user_id, title, description, and days.
   * @returns {WorkoutPlan} Promise that resolves to the updated workout plan or throws an error.
   * @throws Error if there is an issue updating the data or if no data is returned.
   */
  async updateWorkoutPlanById(workoutPlan: WorkoutPlan) {
    try {
      const updatedWorkout = await this.supabaseService.updatePlan(workoutPlan);
      await this.getUserWorkoutPlans(workoutPlan.user_id); // Refresh the list after updating
      return updatedWorkout;
    } catch (error) {
      console.error('Error updating workout by ID:', error);
      this.workoutListChanged.next([]);
      return null;
    }
  }

  /**
   * Update an exercise in the workout plan by its ID.
   * @param exercise - The exercise object containing id, user_id, day_id, name, sets, reps, weight, and optional notes.
   * @returns {Exercise} Promise that resolves to the updated exercise or throws an error.
   * @throws Error if there is an issue updating the data or if no data is returned.
   */
  async updateExercisePlanById(exercise: Exercise) {
    try {
      const updatedExercise = await this.supabaseService.updateExercisePlanById(
        exercise
      );
      await this.getRoutineById(exercise.day_id); // Refresh the list after updating
      return updatedExercise;
    } catch (error) {
      console.error('Error updating exercise by ID:', error);
      this.exerciseListChanged.next([]);
      return null;
    }
  }

  /***** DELETE METHODS *****/

  /**
   * Delete a workout plan by its ID.
   * @param workoutId - The ID of the workout plan to delete.
   * @return {Promise<void>} Promise that resolves when the workout plan is deleted.
   * @throws Error if there is an issue deleting the data or if no data is returned.
   */
  async deleteWorkout(userId: string, workoutId: string): Promise<void | null> {
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

  /**
   * Delete an exercise by its ID.
   * @param exerciseId - The ID of the exercise to delete.
   * @return {Promise<void>} Promise that resolves when the exercise is deleted.
   * @throws Error if there is an issue deleting the data or if no data is returned.
   */
  async deleteExercise(
    exerciseId: string,
    userId: string
  ): Promise<void | null> {
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
}
