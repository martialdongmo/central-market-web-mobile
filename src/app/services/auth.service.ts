import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSource = new BehaviorSubject<User | null>(null);
  user$ = this.userSource.asObservable();

  get isLoggedIn(): boolean { return this.userSource.value !== null; }
  get currentUser(): User | null { return this.userSource.value; }

  login(email: string, password: string): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: '1',
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          email,
        };
        this.userSource.next(user);
        resolve(user);
      }, 1200);
    });
  }

  register(name: string, email: string, password: string): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = { id: '1', name, email };
        this.userSource.next(user);
        resolve(user);
      }, 1200);
    });
  }

  logout(): void { this.userSource.next(null); }
}
