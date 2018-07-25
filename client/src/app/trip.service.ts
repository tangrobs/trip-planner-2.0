import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class TripService {

  constructor(private _http:HttpClient) { }
  getApi(lat, lng) {
    return this._http.get('/googlemapapi');
  }
}
