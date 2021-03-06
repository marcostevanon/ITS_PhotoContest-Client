import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from '../api.service';
import { User } from 'src/model/user.model';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  firstname_error: boolean = false;
  email_error: boolean = false;
  username_error: boolean = false;
  password_error: boolean = false;
  registration_error: boolean = false;
  registration_error_message: string = 'User already exist';
  registration_completed: boolean = false;

  isLoading: boolean = false;
  public username;

  constructor(private apiService: ApiService) { }

  signup(form: NgForm) {
    this.registration_error = false;

    const val = form.value;
    this.firstname_error = val.firstname ? false : true;
    this.email_error = val.email ? false : true;
    this.username_error = val.username ? false : true;
    this.password_error = val.password ? false : true;

    if (form.valid && val.firstname && val.username && val.email && val.password) {
      this.isLoading = true;

      var user = new User(val.firstname, val.lastname, val.email, val.username, val.password, val.avatar);
      this.apiService.signup(user)
        .then(() => {
          form.reset();
          this.isLoading = false;
          this.registration_completed = true;
        })
        .catch(err => {
          this.isLoading = false;
          this.registration_error = true;
          if (err.name == "HttpErrorResponse") {
            this.registration_error_message = "Server may be offline, try again later :("
          } else {
            this.registration_error_message = err.message;
          }
        });
    }
  }


  ngOnInit() { }

  login(form: NgForm) {
    this.registration_error = false;
  }
}
