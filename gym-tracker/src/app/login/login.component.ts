import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';

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

  ngOnInit(): void {
    // Check if already logged in
    this.supabaseService.currentUser.subscribe((user) => {
      if (user) {
        this.router.navigate(['/home']);
      }
    });

    // Update form based on mode
    this.updateFormFields();
  }

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
        this.router.navigate(['/home']);
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
