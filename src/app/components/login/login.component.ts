import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      
      this.authService.login(username, password).subscribe({
        next: () => {
          this.router.navigate(['/kanban']);
        },
        error: (error) => {
          let message = 'Falha na autenticação';
          if (error.error && error.error.detail) {
            message = error.error.detail;
          }
          this.snackBar.open(message, 'Fechar', {
            duration: 3000
          });
        }
      });
    }
  }
}