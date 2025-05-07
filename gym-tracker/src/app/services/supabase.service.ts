import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
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
  
  async loadUser() {
    const { data } = await this.supabase.auth.getSession();
    this._currentUser.next(data.session?.user || null);
    return data.session?.user;
  }
  
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email, 
      password
    });
    
    if (error) {
      throw error;
    }
    
    this._currentUser.next(data.user);
    return data;
  }
  
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      throw error;
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
}