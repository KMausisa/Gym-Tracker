import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  Form,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SupabaseService } from '../../../services/supabase.service';
import { User } from '../user.model';

@Component({
  selector: 'app-profile-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css',
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  user!: User;
  userInfo!: { name: string; birthday: string };
  profileEditForm: FormGroup;
  errorMessage: string = '';
  maxDate: string;

  loading: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    // Initialize the form with validation rules
    this.profileEditForm = this.fb.group({
      full_name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-ZÀ-ÿ.'\- ]+$/), // Allows letters, spaces, apostrophes, and hyphens
        ],
      ],
      birthday: ['', [Validators.required]],
    });

    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  async ngOnInit() {
    this.supabaseService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (user) => {
        this.user = user;
      });

    this.loadProfile();
  }

  /**
   * Loads the user's profile information from Supabase.
   * Populates the form with the user's name and birthday.
   */
  async loadProfile() {
    this.userInfo = await this.supabaseService.getUserInfo(this.user.id);

    this.profileEditForm.patchValue({
      full_name: this.userInfo.name,
      birthday: this.userInfo.birthday,
    });
  }

  /**
   * Submits the profile edit form.
   * Validates the form, shows loading state, and updates user info in Supabase.
   * @returns {Promise<void>} - Resolves when update is complete.
   * @throws {Error} If update fails, sets error message.
   */
  async onSubmit() {
    if (this.profileEditForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const { full_name, birthday } = this.profileEditForm.value;
      await this.supabaseService.updateProfileInfo(this.user.id, {
        full_name,
        birthday,
      });
      this.router.navigate(['/profile']);
    } catch (error: any) {
      this.errorMessage = error.message || 'User Info could not be updated';
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
