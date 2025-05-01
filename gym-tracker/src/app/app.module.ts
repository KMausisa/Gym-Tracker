import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

// Import components
import {HeaderComponent} from './header/header.component';
import { HomeComponent } from './home/home.component';
import { WorkoutComponent } from './workout/workout.component';
import { ProgressComponent } from './progress/progress.component';
import { AccountComponent } from './account/account.component';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppComponent,
    HeaderComponent,
    HomeComponent,
    WorkoutComponent,
    ProgressComponent,
    AccountComponent
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }