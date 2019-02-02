import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginResponse } from 'src/model/loginresponse.model';
import * as moment from "moment";
import { User } from 'src/model/user.model';
import { Post } from 'src/model/post.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base_url = environment.api_endpoint;
  private readonly defaultHeader = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  public redirectUrl: string;

  constructor(private http: HttpClient, private router: Router) { }

  // AUTH REQUESTS
  login(username: string, password: string) {
    return new Promise((resolve, reject) => {

      this.http.post<LoginResponse>(`${this.base_url}/auth/login`, { username, password }, this.defaultHeader)
        .subscribe(authResult => {
          this.setSession(authResult);
          this.router.navigateByUrl(this.redirectUrl || '/gallery');
          resolve();
        }, err => {
          reject({ status: err.status, message: err.error.message || err.statusText })
        });
    });
  }

  private setSession(authResult) {
    const expiresAt = moment().add(authResult.expiresIn, 'second');

    localStorage.setItem('token', authResult.token);
    localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));
    localStorage.setItem('userdata', JSON.stringify(authResult.user))
  }

  isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("expires_at");
    localStorage.removeItem('userdata');
    this.router.navigateByUrl('/login');
  }

  getUserData(): User {
    var user: User = JSON.parse(localStorage.getItem('userdata'))
    if (!user.avatar) user.avatar = environment.default_avatar;
    return user;
  }

  // API REQUEST
  getGallery() {
    return new Promise((resolve, reject) => {
      this.http.get<Array<Post>>(`${this.base_url}/gallery`, this.getAuthenticatedHeader())
        .subscribe(
          (response: Array<Post>) => resolve(response),
          (err) => reject(err));
    })
  }

  getAuthenticatedHeader(): object {
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'x-access-token': localStorage.getItem('token') }) }
  }

  setVote(post_id, vote_value) {
    return new Promise((resolve, reject) => {
      this.http.post<Array<Post>>(`${this.base_url}/vote`,
        {
          image_id: post_id,
          user_id: this.getUserData().id,
          value: vote_value
        }, this.getAuthenticatedHeader())
        .subscribe(
          (response) => resolve(response),
          (err) => reject(err));
    })
  }


  //utils
  getExpiration() {
    const expiration = localStorage.getItem("expires_at");
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }
}