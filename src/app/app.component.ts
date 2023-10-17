import { Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleApiService, UserInfo } from './google-api.service';
import { lastValueFrom } from 'rxjs';
import { ViewChildren } from '@angular/core';
import { QueryList } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-outh2-oidc-lib';
  mailSnippets: string[] = []
  userInfo?: UserInfo
  @ViewChildren('name') name: QueryList<ElementRef>;

  constructor(private readonly googleApi: GoogleApiService){
    googleApi.userProfileSubject.subscribe( info => {
      this.userInfo = info
    })
    
  }

  ngOnInit() {
    console.log('name',this.name);
    
  }

  onClick(){
    console.log('name',this.name['first']);

  }

  isLoggedIn(): boolean {
    return this.googleApi.isLoggedIn()
  }

  logout() {
    this.googleApi.signOut()
  }

  async getEmails() {
    if (!this.userInfo) {
      return;
    }

    const userId = this.userInfo?.info.sub as string
    const messages = await lastValueFrom(this.googleApi.emails(userId))
    messages.messages.forEach( (element: any) => {
      const mail = lastValueFrom(this.googleApi.getMail(userId, element.id))
      mail.then( mail => {
        this.mailSnippets.push(mail.snippet)
      })
    });
  }
}
