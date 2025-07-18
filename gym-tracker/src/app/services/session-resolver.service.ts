import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class SessionResolver implements Resolve<Promise<void>> {
  constructor(private supabaseService: SupabaseService) {}

  resolve(): Promise<void> {
    return this.supabaseService.sessionReady;
  }
}
