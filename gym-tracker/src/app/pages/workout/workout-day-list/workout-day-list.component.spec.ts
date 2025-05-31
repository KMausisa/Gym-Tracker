import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutDayListComponent } from './workout-day-list.component';

describe('WorkoutDayListComponent', () => {
  let component: WorkoutDayListComponent;
  let fixture: ComponentFixture<WorkoutDayListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutDayListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutDayListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
