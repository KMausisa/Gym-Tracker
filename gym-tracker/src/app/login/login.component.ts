import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSignUp = false;
  loading = false;
  errorMessage = '';
  maxDate: string;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Set max date to today (prevents future dates for birthday)
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  async ngOnInit() {
    // Wait for Supabase session to be ready
    await this.supabaseService.sessionReady;

    // If user is already authenticated, redirect to dashboard
    if (this.supabaseService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
    this.updateFormFields();
  }

  /**
   * Dynamically updates form fields based on the authentication mode.
   * If in sign-up mode, adds 'fullName' and 'birthday' fields.
   */
  updateFormFields() {
    if (this.isSignUp) {
      // Add name and birthday fields for signup
      this.loginForm.addControl(
        'fullName',
        this.fb.control('', [Validators.required])
      );
      this.loginForm.addControl(
        'birthday',
        this.fb.control('', [Validators.required])
      );
    } else {
      // Remove the additional fields when in login mode
      if (this.loginForm.get('fullName')) {
        this.loginForm.removeControl('fullName');
      }
      if (this.loginForm.get('birthday')) {
        this.loginForm.removeControl('birthday');
      }
    }
  }

  /**
   * Submits the login or sign-up form.
   * Validates the form, shows loading state, and handles authentication.
   * @returns {Promise<void>} - Resolves when authentication is complete.
   * @throws {Error} If authentication fails, sets error message.
   */
  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const { email, password, fullName, birthday } = this.loginForm.value;

      if (this.isSignUp) {
        await this.supabaseService.signUp(email, password, fullName, birthday);
        this.errorMessage = 'Please check your email for verification link.';
      } else {
        await this.supabaseService.signIn(email, password);
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Authentication failed';
    } finally {
      this.loading = false;
    }
  }

  toggleAuthMode() {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = '';
    this.updateFormFields();
  }
}
