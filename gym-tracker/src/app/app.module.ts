import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

// Import components
import {HeaderComponent} from './header/header.component';
import { HomeComponent } from './pages/home/home.component';
import { WorkoutComponent } from './pages/workout/workout.component';
import { ProgressComponent } from './pages/progress/progress.component';
import { AccountComponent } from './pages/account/account.component';

@NgModule({
  declarations: [
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppComponent,
    HomeComponent,
    WorkoutComponent,
    ProgressComponent,
    AccountComponent
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }