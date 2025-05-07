import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSignUp = false;
  loading = false;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  ngOnInit(): void {
    // Check if already logged in
    this.supabaseService.currentUser.subscribe(user => {
      if (user) {
        this.router.navigate(['/home']);
      }
    });
  }
  
  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    try {
      const { email, password } = this.loginForm.value;
      
      if (this.isSignUp) {
        await this.supabaseService.signUp(email, password);
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
  }
}