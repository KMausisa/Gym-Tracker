import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  footerLinks = [
    { label: 'About' },
    { label: 'Privacy' },
    { label: 'Contact' },
  ];

  footerQuote = '"Stay strong, stay consistent."';
  brandName = 'GymTracker';
  year = new Date().getFullYear();
}
