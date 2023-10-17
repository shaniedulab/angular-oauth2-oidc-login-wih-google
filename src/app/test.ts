import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { Subject } from 'rxjs';

const authCodeFlowConfig: AuthConfig = {
  // Url of the Identity Provider
  issuer: 'https://accounts.google.com',

  // strict discovery document disallows urls which not start with issuers url
  strictDiscoveryDocumentValidation: false,

  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin,

  // The SPA's id. The SPA is registerd with this id at the auth-server
  // clientId: 'server.code',
  clientId: '775640216907-8pe8jc1alnni9a9ic21cl0hmpof1ua98.apps.googleusercontent.com',

  // set the scope for the permissions the client should request https://www.googleapis.com/auth/gmail.readonly
  scope: 'openid profile email',

  showDebugInformation: true,
};

export interface UserInfo {
  info: {
    sub: string
    email: string,
    name: string,
    picture: string
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {

  // userProfileSubject = new Subject<UserInfo>()
  userProfileSubject:any;

  constructor(private readonly oAuthService:OAuthService, private readonly httpClient: HttpClient,private router:Router) {
    // confiure oauth2 service
    oAuthService.configure(authCodeFlowConfig);
    // manually configure a logout url, because googles discovery document does not provide it
    oAuthService.logoutUrl = "https://www.google.com/accounts/Logout";
    // oAuthService.logoutUrl = "https://www.google.com/accounts/Logout";

    // loading the discovery document from google, which contains all relevant URL for
    // the OAuth flow, e.g. login url
    oAuthService.loadDiscoveryDocument().then( () => {
      // // This method just tries to parse the token(s) within the url when
      // // the auth-server redirects the user back to the web-app
      // // It doesn't send the user the the login page
      oAuthService.tryLoginImplicitFlow().then( () => {
        // when not logged in, redirecvt to google for login
        // else load user profile
        if (!oAuthService.hasValidAccessToken()) {
          this.router.navigate(['auth','login']);
        } else {
          this.oAuthService.loadUserProfile().then( (userProfile) => {
            console.log(JSON.stringify(userProfile));
            
            this.userProfileSubject=userProfile as UserInfo;
          })
          // this.router.navigate(['pages','dashboard']);
        }
      })
    });
  }

  loginWithGoogle(){
    this.oAuthService.initLoginFlow()
  }

  isLoggedIn(): boolean {
    return this.oAuthService.hasValidAccessToken()
  }

  signOut() {
    this.oAuthService.logOut();
  }

  loadProfile(){
    // this.oAuthService.loadUserProfile().then( (userProfile) => {
    //   console.log(JSON.stringify(userProfile));
      
    //   // this.userProfileSubject.next(userProfile as UserInfo)
    // })
    return this.userProfileSubject;
  }

  private authHeader() : HttpHeaders {
    return new HttpHeaders ({
      'Authorization': `Bearer ${this.oAuthService.getAccessToken()}`
    })
  }
}