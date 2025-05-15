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

  constructor(private router: Router) {
    // Initialize Supabase client
    // Replace these with your actual Supabase URL and public anon key
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    // Check for existing session
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
    console.log('Formatted Birthday:', formattedBirthday);
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

    const accessToken = session?.access_token;
    console.log('Access Token:', accessToken);

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
  async addRoutine(routine: {
    user_id: string;
    title: string;
    description: string;
    days: string[];
  }) {
    console.log('Adding routine:', routine);
    const { data, error } = await this.supabase
      .from('workout_plans')
      .insert([routine]);

    if (error) {
      throw error;
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
}
