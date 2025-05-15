import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutEditComponent } from './workout-edit.component';

describe('WorkoutEditComponent', () => {
  let component: WorkoutEditComponent;
  let fixture: ComponentFixture<WorkoutEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
