import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from 'ionic-angular';
import moment from 'moment';
/*
  Generated class for the SettingsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

const SETT = 'settings'
const QTS = 'quotes'
const ALL_DATA = 'allData';

@Injectable()
export class SettingsProvider {

  // constructor(public http: HttpClient) {
  //   console.log('Hello SettingsProvider Provider');
  // }

  constructor(public storage: Storage, private platform:Platform) { }

  async setSettings(data){
    let allData = await this.storage.get(ALL_DATA);
    if(!allData) {
      allData = {start: data.start, end: data.end, 
        frequency: data.frequency}
    } else {
      allData.start = data.start;
      allData.end = data.end;
      allData.frequency = data.frequency;
    }
    this.storage.set(ALL_DATA, allData);
  }
  getSettings(){
    return this.storage.get(ALL_DATA);
  }

}
