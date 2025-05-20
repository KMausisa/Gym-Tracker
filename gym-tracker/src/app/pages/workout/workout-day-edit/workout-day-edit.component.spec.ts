import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutDayEditComponent } from './workout-day-edit.component';

describe('WorkoutDayEditComponent', () => {
  let component: WorkoutDayEditComponent;
  let fixture: ComponentFixture<WorkoutDayEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutDayEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutDayEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
