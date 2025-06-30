import { Component } from '@angular/core';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-skip-workout-dialog',
  templateUrl: './skip-workout-dialog.component.html',
  styleUrls: ['./skip-workout-dialog.component.css'],
  imports: [
    FormsModule,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
})
export class SkipWorkoutDialogComponent {
  form: FormGroup;
  reason: string = '';

  constructor(
    public dialogRef: MatDialogRef<SkipWorkoutDialogComponent>,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      reason: [
        '',
        [
          Validators.required,
          Validators.maxLength(200),
          // this.sensibleReason, // Custom validator
        ],
      ],
    });
  }

  sensibleReason(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    // Disallow only numbers or only special characters
    if (/^\d+$/.test(value))
      return { nonsense: 'Reason cannot be only numbers.' };
    if (value.trim().length > 0 && value.trim().length < 3)
      return { nonsense: 'Reason is too short.' };
    return null;
  }
  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.reason);
    }
  }
}
