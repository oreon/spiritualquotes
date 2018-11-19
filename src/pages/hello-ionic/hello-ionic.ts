import { Component } from '@angular/core';
import { Observable} from 'rxjs'
import { LocalNotifications, ELocalNotificationTriggerUnit } from '@ionic-native/local-notifications';
import { Platform, NavController } from 'ionic-angular';
import * as moment from 'moment';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from 'angularfire2/firestore';
import { BaseEntity } from '../../base/base-entity';
import { BaseFireService } from '../../base/BaseFireService';


export interface Quote extends BaseEntity{
  text:string
}

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {

  items: any[];
  
  constructor(
    public navCtrl: NavController, 
    private fireService :BaseFireService<Quote>,
    private localNotifications: LocalNotifications,
  ) {
    console.log("Hello Page Init");
    this.fireService.getRecords()
    .subscribe(
      x => this.items = x);
  }
}
