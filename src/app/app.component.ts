import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'kanban-app';
  currentUser: User | null = null;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}