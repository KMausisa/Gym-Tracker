import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

import { Profile } from '../models/profile.model';
import { WorkoutPlan } from '../models/workout_plan.model';
import { Exercise } from '../models/exercise.model';
import { ExerciseProgress } from '../models/exercise_progress.model';
import { WorkoutDay } from '../models/workout_day.model';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _currentUser = new BehaviorSubject<any>(null);

  private sessionReadyResolver!: () => void;
  public sessionReady: Promise<void>;

  constructor(private router: Router) {
    // Initialize Supabase client
    // Replace these with your actual Supabase URL and public anon key
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    // Create a promise that resolves when session is loaded
    this.sessionReady = new Promise<void>((resolve) => {
      this.sessionReadyResolver = resolve;
    });

    // Load the user
    this.loadUser();

    // Set up auth state change listener
    this.supabase.auth.onAuthStateChange((event, session) => {
      // If the session has a user, update the current user
      if (session?.user) {
        this._currentUser.next(session.user);
      } else {
        // If no user is logged in, set current user to null
        this._currentUser.next(null);
      }
    });
  }

  /**
   * This method loads the current user from Supabase and updates the BehaviorSubject.
   * @returns Promise that resolves to the current user or null if not logged in.
   */
  async loadUser() {
    const { data } = await this.supabase.auth.getSession();
    this._currentUser.next(data.session?.user || null);
    // Resolve the sessionReady promise
    if (this.sessionReadyResolver) this.sessionReadyResolver();
    return data.session?.user;
  }

  /***** GETTER METHODS *****/

  /**
   * Get the current user as an observable
   * @returns Observable of the current user
   * */
  get currentUser() {
    return this._currentUser.asObservable();
  }

  /** Get the current user value directly
   * @returns The current user object or null if not logged in
   * */
  get currentUserValue() {
    return this._currentUser.value;
  }

  /** Get the user ID of the current user
   * @returns The user ID as a string or null if not logged in
   * */
  get userId(): string | null {
    // Returns null if no user is logged in
    return this._currentUser.value?.id || null;
  }

  /** Check if the user is authenticated
   * @returns True if the user is authenticated, false otherwise
   * */
  get isAuthenticated(): boolean {
    return this._currentUser.value !== null;
  }

  /***** AUTHENTICATION METHODS *****/

  /** Sign in with email and password
   * @param email - The user's email address
   * @param password - The user's password
   * @returns Promise that resolves to the sign-in data or throws an error
   * @throws Error if there is an issue signing in
   * */
  async signIn(email: string, password: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      this._currentUser.next(data.user);
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  /** Sign up with email, password, and optional profile data
   * @param email - The user's email address
   * @param password - The user's password
   * @param fullName - Optional full name of the user
   * @param birthday - Optional birthday of the user in ISO format
   * @returns Promise that resolves to the sign-up data or throws an error
   * @throws Error if there is an issue signing up or creating the profile
   * */
  async signUp(
    email: string,
    password: string,
    fullName?: string,
    birthday?: string
  ) {
    // Format the birthday to ISO date string if provided
    const formattedBirthday = birthday
      ? new Date(birthday).toISOString().split('T')[0]
      : null;

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            birthday: formattedBirthday,
          },
        },
      });

      if (error) {
        throw error;
      }

      const {
        data: { session },
      } = await this.supabase.auth.getSession();

      // If we have additional profile data and the signup was successful
      if (data.user && (fullName || birthday)) {
        // Insert or update the profile in the 'profiles' table
        try {
          await this.supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            birthday: formattedBirthday,
            email: email,
            updated_at: new Date(),
          });
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   * @returns Promise that resolves when the user is signed out
   * */
  async signOut() {
    await this.supabase.auth.signOut();
    this._currentUser.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Check if the user is logged in
   * @return True if the user is logged in, false otherwise
   * */
  isLoggedIn(): boolean {
    return this._currentUser.value !== null;
  }

  /***** GETTER METHODS *****/

  /**
   * Get User Profile
   * @param userId - The ID of the user whose profile is to be fetched.
   * @returns {Profile} Promise that resolves to the user's profile or throws an error if not found.
   * @throws Error if there is an issue fetching the data.
   * */
  async getUserProfile(userId: string): Promise<Profile> {
    const id = userId ?? this.userId;
    if (!id) {
      throw new Error('User ID is required to fetch profile.');
    }
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Gets the users full name and birthday based on their ID.
   * @param userId - The ID of the user.
   * @returns A Promise that resolves to an object. The object contains the user's full name and birthday.
   * @throws an error if the fetch operation wasn't successful.
   */
  async getUserInfo(
    userId: string
  ): Promise<{ name: string; birthday: string }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('full_name, birthday')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return { name: '', birthday: '' };
    }

    return {
      name: data.full_name,
      birthday: data.birthday, // ISO string like '2001-01-01'
    };
  }

  /**
   * Get the User's total workout count
   * @param userId  - The ID of the user whose count are to be fetched.
   * @returns Promise that resolves to a number.
   */
  async getWorkoutCount(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('workouts_completed')
        .eq('id', userId)
        .single();

      if (error || !data) return 0;
      return data.workouts_completed;
    } catch (error) {
      console.error("Error fetching user's total workout count:", error);
      throw error;
    }
  }

  /**
   * Get User Workouts by User ID
   * @param userId - The ID of the user whose workouts are to be fetched.
   * @returns {Array<WorkoutPlan>} Promise that resolves to an array of workout plans or an empty array if not found.
   * @throws Error if there is an issue fetching the data.
   * */
  async getUserWorkouts(userId: string): Promise<WorkoutPlan[]> {
    try {
      const { data, error } = await this.supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return data ?? [];
    } catch (error) {
      console.error('Error fetching user workouts:', error);
      throw error;
    }
  }

  /**
   * Get a specific workout by ID
   * @param workoutId - The ID of the workout plan to fetch.
   * @returns {WorkoutPlan} Promise that resolves to the workout plan or an empty array if not found.
   * @throws Error if there is an issue fetching the data.
   * */
  async getWorkoutById(workoutId: string): Promise<WorkoutPlan> {
    try {
      const { data, error } = await this.supabase
        .from('workout_plans')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (error) {
        throw error;
      }

      return data ?? [];
    } catch (error) {
      console.error('Error fetching workout by ID:', error);
      throw error;
    }
  }

  /** Gets all exercises for a user by user ID
   * @param userId - The ID of the user whose exercises are to be fetched.
   * @returns {Array<Exercise>} Promise that resolves to an array of exercises or an empty list if not found.
   * @throws Error if there is an issue fetching the data.
   * */
  async getUserExercises(userId: string): Promise<Exercise[]> {
    try {
      const { data, error } = await this.supabase
        .from('exercises')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return data ?? [];
    } catch (error) {
      console.error('Error fetching user exercises:', error);
      throw error;
    }
  }

  /**
   * Get specific exercise by exercise ID
   * @param exerciseId - The ID of the exercise to fetch.
   * @returns {Exercise | null} Promise that resolves to the exercise or null if not found.
   * @throws Error if there is an issue fetching the data.
   * */
  async getExerciseById(exerciseId: string): Promise<Exercise | null> {
    try {
      const { data, error } = await this.supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();

      if (error) {
        throw error;
      }

      return data ?? null;
    } catch (error) {
      console.error('Error fetching exercise by ID:', error);
      throw error;
    }
  }

  // Get Day ID based on workout ID and day
  /**
   * Get the ID of a workout day based on the workout ID and day of the week.
   * @param workoutId - The ID of the workout plan.
   * @param day - The day of the week (e.g., 'Monday', 'Tuesday').
   * @returns The ID of the workout day.
   * @throws Error if there is an issue fetching the data.
   *
   */
  async getDayId(workoutId: string, day: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('workout_days')
        .select('id')
        .eq('plan_id', workoutId)
        .eq('day_of_week', day)
        .single();

      if (error) {
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error fetching day ID:', error);
      throw error;
    }
  }

  // Get routine based on workout ID and day
  /**
   * Get the routine (exercises) for a specific day in a workout plan.
   * @param dayId - The ID of the workout day.
   * @returns {Array<{Exercise}>} An array of exercises for that day or an empty list if not found.
   * @throws Error if there is an issue fetching the data.
   */
  async getRoutineById(dayId: string): Promise<Exercise[]> {
    try {
      const { data, error } = await this.supabase
        .from('exercises')
        .select('*')
        .eq('day_id', dayId);

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error('Error fetching routine by day ID:', error);
      throw error;
    }
  }

  /**
   * Get workout progress for a user by user ID.
   * @param userId - The ID of the user whose workout progress is to be fetched.
   * @returns {Array<ExerciseProgress>} Promise that resolves to an array of exercise progress or null if not found.
   * @throws Error if there is an issue fetching the data.
   */
  async getWorkoutProgress(userId: string): Promise<ExerciseProgress[]> {
    try {
      const { data, error } = await this.supabase
        .from('exercise_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return data ?? [];
    } catch (error) {
      console.error('Error fetching workout progress:', error);
      throw error;
    }
  }

  /**
   * Get a specific exercise progress for a user by user ID and exercise ID.
   * @param userId - The ID of the user whose exercise progress is to be fetched.
   * @param exerciseId - The ID of the exercise for which progress is to be fetched.
   * @returns {Array<ExerciseProgress>} Promise that resolves to an array of exercise progress or null if not found.
   * @throws Error if there is an issue fetching the data.
   */
  async getExerciseProgress(
    userId: string,
    exerciseId: string
  ): Promise<ExerciseProgress[]> {
    try {
      const { data, error } = await this.supabase
        .from('exercise_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId);

      if (error) {
        throw error;
      }

      return data ?? [];
    } catch (error) {
      console.error('Error fetching exercise progress:', error);
      throw error;
    }
  }

  /**
   * Get the total workout count for a user
   * @param workout_id - The ID of the workout plan.
   * @return {number} Promise that resolves to the total count of workouts or 0 if not found.
   * @throws Error if there is an issue fetching the data.
   * */
  async getTotalWorkoutCount(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('workouts_completed')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }
      return data?.workouts_completed ?? 0; // Return 0 if count is null
    } catch (error) {
      console.error('Error fetching total workout count:', error);
      throw error;
    }
  }

  /***** ADD, CREATE, AND INSERT METHODS *****/

  /**
   * Add a new workout plan.
   * @param plan - The workout plan object containing user_id, title, description, and days.
   * @returns {WorkoutPlan} Promise that resolves to the created workout plan or throws an error.
   * @throws Error if there is an issue inserting the data or if no data is returned.
   * */
  async addWorkoutPlan(workoutPlan: Omit<WorkoutPlan, 'id'>) {
    try {
      const { data, error } = await this.supabase
        .from('workout_plans')
        .insert([workoutPlan])
        .select()
        .single();

      if (!data) {
        throw new Error(
          'Workout plan insertion succeeded but returned no data.'
        );
      }

      if (error) {
        console.error('Error inserting workout plan:', error);
        throw error;
      }

      // Insert the workout days into the workout_days table
      const daysToInsert = workoutPlan.days.map((day, index) => ({
        plan_id: data.id,
        user_id: workoutPlan.user_id,
        day_of_week: day,
        position: index,
      }));

      try {
        const { error: daysError } = await this.supabase
          .from('workout_days')
          .insert(daysToInsert);

        return data;
      } catch (daysError) {
        console.error('Error inserting workout days:', daysError);
        throw daysError;
      }
    } catch (error) {
      console.error('Error adding workout plan:', error);
      throw error;
    }
  }

  /**
   * Add Exercise to a specific workout day
   * @param exercise - The exercise object containing user_id, day_id, name, sets, reps, weight, and optional notes.
   * @returns {Exercise} Promise that resolves to the created exercise or throws an error.
   * @throws Error if there is an issue inserting the data or if no data is returned.
   * */
  async addExerciseToWorkoutDay(exercise: Omit<Exercise, 'id'>) {
    try {
      const { data, error } = await this.supabase
        .from('exercises')
        .insert([exercise]);
      console.log('Insert result: ', { data, error });
      return data;
    } catch (error) {
      console.error('Error adding exercise to workout day:', error);
      throw error;
    }
  }

  /**
   * Save workout progress for a specific exercise
   * @param exerciseProgress - The exercise object containing user_id, day_id, name, and the users recorded sets, reps, weight, and optional notes.
   * @returns {ExerciseProgress} Promise that resolves to the created exercise progress or throws an error.
   * @throws Error if there is an issue inserting the data or if no data is returned.
   * */
  async saveWorkoutProgress(exerciseProgress: Omit<ExerciseProgress, 'id'>) {
    try {
      const { data, error } = await this.supabase
        .from('exercise_progress')
        .insert([exerciseProgress])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error saving workout progress:', error);
      throw error;
    }
  }

  /**
   * Update the user's name and birthday based on their id.
   * @param userId - ID of the user.
   * @param info - The info to be updated in the user's profile. The user can update their name and birthday.
   * @returns - A Promise that resolves into an object that tells the user if the operation was successful.
   * @throws an error if the update was not successful.
   */
  async updateProfileInfo(
    userId: string,
    info: { full_name: string; birthday: string }
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(info)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Supabase update profile error: ', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error updating user information: ', error);
      return { success: false, error };
    }
  }

  /**
   * Update the workout plan based on the id.
   * @param workoutPlan - The workout plan object containing id, user_id, title, description, and days.
   * @returns {WorkoutPlan} Promise that resolves to the updated workout plan or throws an error.
   * @throws Error if there is an issue updating the data or if no data is returned.
   */
  async updatePlan(workoutPlan: WorkoutPlan) {
    try {
      const { data, error } = await this.supabase
        .from('workout_plans')
        .update(workoutPlan)
        .eq('id', workoutPlan.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Workout plan update succeeded but returned no data.');
      }

      const { data: existingDays, error: fetchDaysError } = await this.supabase
        .from('workout_days')
        .select('id, day_of_week')
        .eq('plan_id', workoutPlan.id);

      if (fetchDaysError) {
        console.error(fetchDaysError);
        return;
      }

      const existingDayNames = (existingDays ?? []).map(
        (d: any) => d.day_of_week
      );

      // Update the days in the workout_days table
      const daysToUpdate = workoutPlan.days
        .filter((day) => !existingDayNames.includes(day))
        .map((day, index) => ({
          plan_id: workoutPlan.id,
          user_id: workoutPlan.user_id,
          day_of_week: day,
          position: index,
        }));

      if (daysToUpdate.length > 0) {
        const { error: daysError } = await this.supabase
          .from('workout_days')
          .upsert(daysToUpdate);

        if (daysError) {
          console.error(daysError);
          return;
        }
      }

      // --- DELETE REMOVED DAYS ---

      const daysToDelete = (existingDays ?? []).filter(
        (d: any) => !workoutPlan.days.includes(d.day_of_week)
      );

      if (daysToDelete.length > 0) {
        const idsToDelete = daysToDelete.map((d: any) => d.id);
        const { error: deleteError } = await this.supabase
          .from('workout_days')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          console.error(deleteError);
          return;
        }
      }

      return data;
    } catch (error) {
      console.error('Error updating workout plan:', error);
      throw error;
    }
  }

  /**
   * Update an exercise in the workout plan by its ID.
   * @param exercise - The exercise object containing id, user_id, day_id, name, sets, reps, weight, and optional notes.
   * @returns {Exercise} Promise that resolves to the updated exercise or throws an error.
   * @throws Error if there is an issue updating the data or if no data is returned.
   */
  async updateExercisePlanById(exercise: Exercise) {
    const { data, error } = await this.supabase
      .from('exercises')
      .update({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        notes: exercise.notes,
      })
      .eq('id', exercise.id)
      .eq('day_id', exercise.day_id)
      .eq('user_id', exercise.user_id)
      .select();

    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error('Exercise update succeeded but returned no data.');
    }
    return data;
  }

  async updateTotalWorkoutCount(userId: string, count: number): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .upsert({ id: userId, workouts_completed: count });

    if (error) {
      console.error('Update error:', error);
    }
  }

  /***** DELETE METHODS *****/

  /**
   * Delete a workout plan by its ID.
   * @param workoutId - The ID of the workout plan to delete.
   * @return {Promise<void>} Promise that resolves when the workout plan is deleted.
   * @throws Error if there is an issue deleting the data or if no data is returned.
   */
  async deleteWorkout(workoutId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('workout_plans')
        .delete()
        .eq('id', workoutId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      throw error;
    }
  }

  /**
   * Delete an exercise by its ID.
   * @param exerciseId - The ID of the exercise to delete.
   * @return {Promise<void>} Promise that resolves when the exercise is deleted.
   * @throws Error if there is an issue deleting the data or if no data is returned.
   */
  async deleteExercise(exerciseId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  }
}
