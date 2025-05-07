import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private auth = inject(SupabaseService)
  private router = inject(Router)
  
  async logOut() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/login'])
    }).catch((error) => {
      alert('Error logging out: ' + error.message)
    })
  }
}
