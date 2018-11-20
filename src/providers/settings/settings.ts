import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from 'ionic-angular';

/*
  Generated class for the SettingsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

const SETT = 'settings'
const QTS = 'quotes'
@Injectable()
export class SettingsProvider {

  // constructor(public http: HttpClient) {
  //   console.log('Hello SettingsProvider Provider');
  // }

  constructor(public storage: Storage, private platform:Platform) { }

  setSettings(data){
    return this.storage.set(SETT, data);
  }
  getSettings(){
    return this.storage.get(SETT);
  }

}
