import { GLOBAL } from './global';
import { Injectable } from '@angular/core';
import { HttpClient , HttpHeaders} from '@angular/common/http';
import { Observable} from 'rxjs/Observable';
import { User } from '../Models/user';

@Injectable()
export class UserService {
  public url: String ;

  constructor(public _http: HttpClient) {
    this.url =  GLOBAL.url;
  }

  register(user: User): Observable<any>{
    const params = JSON.stringify(user);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.url + 'register', params , { headers : headers});
  }

  login(user: any  , gettoken = null ): any {
    if(gettoken!= null){
       user.gettoken = gettoken ;
    }

    let params = JSON.stringify(user);
    let headers =  new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.url + 'login' , params , {headers: headers});
  }

}
