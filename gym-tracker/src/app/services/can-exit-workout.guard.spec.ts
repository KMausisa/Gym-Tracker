import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { canExitWorkoutGuard } from './can-exit-workout.guard';

describe('canExitWorkoutGuard', () => {
  const executeGuard: CanDeactivateFn<unknown> = (...guardParameters) => 
      TestBed.runInInjectionContext(() => canExitWorkoutGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
