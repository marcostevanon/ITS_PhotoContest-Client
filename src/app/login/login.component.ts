import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isUsernameValid: boolean = true;
  isPasswordValid: boolean = true;
  isFormValid: boolean = true;
  loginErrorMessage: string;

  isLoading: boolean = false;

  alreadyLoggedIn: boolean = false;
  loggedInUsername: string;

  constructor(private authService: AuthService) {
    this.alreadyLoggedIn = authService.isLoggedIn();
    if (this.alreadyLoggedIn)
      this.loggedInUsername = authService.getUserData().username;
  }

  submit(form: NgForm) {
    this.isFormValid = true;

    const val = form.value;
    this.isUsernameValid = val.username != "";
    this.isPasswordValid = val.password != "";

    if (form.valid && val.username && val.password) {
      this.isLoading = true;

      this.authService.login(val.username, val.password)
        .then(() => { this.isLoading = false; })
        .catch((err) => {
          this.isLoading = false;
          this.isFormValid = false;
          this.loginErrorMessage = err.message;
        });
    }
  }

  ngOnInit() { }

}