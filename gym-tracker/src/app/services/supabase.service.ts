import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

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

    this.loadUser();

    // Set up auth state change listener
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this._currentUser.next(session.user);
      } else if (event === 'SIGNED_OUT') {
        this._currentUser.next(null);
      }
    });
  }

  get currentUser() {
    return this._currentUser.asObservable();
  }

  // Add this getter to easily access the current user value
  get currentUserValue() {
    return this._currentUser.value;
  }

  // Add this getter to easily access the current user's ID
  get userId(): string | null {
    return this._currentUser.value?.id || null;
  }

  get isAuthenticated(): boolean {
    return this._currentUser.value !== null;
  }

  async loadUser() {
    const { data } = await this.supabase.auth.getSession();
    this._currentUser.next(data.session?.user || null);
    // Resolve the sessionReady promise
    if (this.sessionReadyResolver) this.sessionReadyResolver();
    return data.session?.user;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    this._currentUser.next(data.user);
    return data;
  }

  async signUp(
    email: string,
    password: string,
    fullName?: string,
    birthday?: string
  ) {
    const formattedBirthday = birthday
      ? new Date(birthday).toISOString().split('T')[0]
      : null;
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
      // Optional: Create a more detailed profile in a separate table
      // This is useful if you want to query by these fields later
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
        // Don't throw here - the user is still created, the profile update failed
      }
    }

    return data;
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this._currentUser.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this._currentUser.value !== null;
  }

  // Method to get profile data including name and birthday
  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  // You can also add a convenience method to get the current user's profile
  async getCurrentUserProfile() {
    if (!this.userId) {
      return null;
    }

    return this.getUserProfile(this.userId);
  }

  // **** Workout Methods **** //
  async addWorkoutPlan(plan: {
    user_id: string;
    title: string;
    description: string;
    days: string[];
  }) {
    const { data, error } = await this.supabase
      .from('workout_plans')
      .insert([plan])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Workout plan insertion succeeded but returned no data.');
    }

    const daysToInsert = plan.days.map((day, index) => ({
      plan_id: data.id,
      user_id: plan.user_id,
      day_of_week: day,
      position: index,
    }));

    const { error: daysError } = await this.supabase
      .from('workout_days')
      .insert(daysToInsert);

    if (daysError) {
      console.error(daysError);
      return;
    }

    return data;
  }

  async getUserWorkouts(userId: string) {
    const { data, error } = await this.supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
    return data;
  }

  async getWorkoutById(workoutId: string) {
    const { data, error } = await this.supabase
      .from('workout_plans')
      .select('*')
      .eq('id', workoutId)
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  /***** Exercise Methods *****/
  async getExerciseById(exerciseId: string) {
    const { data, error } = await this.supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (error) {
      throw error;
    }
    return data;
  }
  // Add Exercise to a specific workout day
  async addExerciseToWorkoutDay(exercise: {
    user_id: string;
    day_id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    notes?: string;
  }) {
    const { data, error } = await this.supabase
      .from('exercises')
      .insert([exercise]);

    if (error) {
      throw error;
    }
    return data;
  }

  // Get Day ID based on workout ID and day
  async getDayId(workoutId: string, day: string) {
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
  }

  // Get routine based on workout ID and day
  async getRoutineById(dayId: string) {
    const { data, error } = await this.supabase
      .from('exercises')
      .select('*')
      .eq('day_id', dayId);

    if (error) {
      throw error;
    }
    return data;
  }

  async updatePlan(routine: {
    user_id: string;
    id: string;
    title: string;
    description: string;
    days: string[];
  }) {
    const { data, error } = await this.supabase
      .from('workout_plans')
      .update({
        title: routine.title,
        description: routine.description,
        days: routine.days,
      })
      .eq('id', routine.id)
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
      .eq('plan_id', routine.id);

    if (fetchDaysError) {
      console.error(fetchDaysError);
      return;
    }

    const existingDayNames = (existingDays ?? []).map(
      (d: any) => d.day_of_week
    );

    // Update the days in the workout_days table
    const daysToUpdate = routine.days
      .filter((day) => !existingDayNames.includes(day))
      .map((day, index) => ({
        plan_id: routine.id,
        user_id: routine.user_id,
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
      (d: any) => !routine.days.includes(d.day_of_week)
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
    const { data, error } = await this.supabase
      .from('exercises')
      .update({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        notes: exercise.notes,
      })
      .eq('id', exercise.exerciseId)
      .eq('day_id', exercise.dayId)
      .eq('user_id', exercise.userId)
      .select();

    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error('Exercise update succeeded but returned no data.');
    }
    return data;
  }

  async deleteWorkout(workoutId: string) {
    const { error } = await this.supabase
      .from('workout_plans')
      .delete()
      .eq('id', workoutId);

    if (error) {
      throw error;
    }
  }

  async deleteExercise(exerciseId: string) {
    const { error } = await this.supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) {
      throw error;
    }
  }
}
