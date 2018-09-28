import { GLOBAL } from './../fecha/globales';
import { Http, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';

/*
  Generated class for the ApiServicesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiServicesProvider {

  public API_URL: string;
  public headers;

  constructor(
    public http: Http

  ) {
    this.API_URL = GLOBAL.url;
    this.headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    
  }

  login(login) {

    let json = JSON.stringify(login);
    //console.log("JSON: ", json);

    let parametros = "json=" + json;

    return new Promise((resolve, reject) => {
      this.http.post(this.API_URL + 'login', parametros, { headers: this.headers })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          reject(error);
        })
    }).catch((error) => {
      console.error('API Error: ', error.status);
      console.error('API Error: ', JSON.stringify(error));
    })
  }


}
