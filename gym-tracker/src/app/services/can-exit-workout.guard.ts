import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HomeComponent } from '../pages/home/home.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CanExitWorkoutGuard implements CanDeactivate<HomeComponent> {
  constructor(private dialog: MatDialog) {}

  canDeactivate(component: HomeComponent): Observable<boolean> | boolean {
    if (component.inWorkout) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          message:
            'You have an active workout. Are you sure you want to leave?',
        },
      });
      return dialogRef.afterClosed().pipe(
        switchMap((result) => {
          if (result) {
            component.resetWorkoutProgress(); // <-- Reset state here
            return of(true);
          }
          return of(false);
        })
      );
    }
    return true;
  }
}
