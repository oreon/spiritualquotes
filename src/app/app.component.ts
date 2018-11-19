import { Component, ViewChild } from '@angular/core';

import { Platform, MenuController, Nav } from 'ionic-angular';

import { HelloIonicPage, Quote } from '../pages/hello-ionic/hello-ionic';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { LoginPage } from '../pages/login/login';
import { AngularFireDatabase } from '@angular/fire/database';
import { BaseFireService } from '../base/BaseFireService';
import { Storage } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications';
import moment from 'moment';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage = HelloIonicPage;
  pages: Array<{title: string, component: any}>;
  quotes: any[];

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public afAuth: AngularFireAuth,
    private afDB: AngularFireDatabase,
    private fireService: BaseFireService<Quote>,
    private storage: Storage,
    private localNotifications: LocalNotifications,
  ) {
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'Hello Ionic', component: HelloIonicPage },
      { title: 'My First List', component: ListPage }
    ];
  }

  initializeApp() {
    // this.afAuth.auth
    // .signInWithPopup(new auth.GoogleAuthProvider())
    // .then
    //   (
    //   user => {
    //     if (user) {
    //       console.log(user)
    //       this.afDB.list('quotes').valueChanges().subscribe(
    //         x => console.log(x)
    //       )
    //       //this.rootPage = HelloIonicPage;
    //     } else {
    //       console.log("error finding user")
    //     }
    //   },
    // )
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      if (!this.localNotifications.hasPermission())
        this.localNotifications.requestPermission();

      this.storage.get('noOfNotifScheduled').then((noOfNotifScheduled) => {
        console.log("App Start",noOfNotifScheduled);
        if(!noOfNotifScheduled){
          this.storage.set('noOfNotifScheduled', 10);
        }
      });
      this.storage.get('quotesData').then((quoteData) => {
        console.log('Quotes from local storage', quoteData);
        const timeGap = (quoteData && quoteData.timeGap) ? quoteData.timeGap : 2;
        const startTime = (quoteData && quoteData.startTime) ? quoteData.startTime : Date.now();
        const endTime = (quoteData && quoteData.endTime) ? quoteData.endTime : Date.now();
        
        let fixedDate = moment();  
        if(quoteData && quoteData.quotes && quoteData.quotes.length){
            for(let i=0; i < quoteData.quotes.length; i++) {
              let triggerTime = new Date(moment(fixedDate).add((i+1)*timeGap, 'minutes').format());
              this.localNotifications.schedule({
                id: i,
                title: 'Gurmat Tuk',
                text: quoteData.quotes[i].text,
                trigger: { at:  triggerTime},
                led: 'FFF000',
                sound: this.platform.is('android') ? 'file://assets/sounds/sound.mp3': 'file://assets/sounds/beep.caf',
                vibrate: true,
                icon: 'file://assets/imgs/icon.png'
              });
            }
        } else {
          this.fireService.getRecords().subscribe(x => {
            console.log(x);
            this.quotes = x;
            this.storage.set('quotesData', {'quotes': this.quotes, quoteNo: 0});
            for(let i=0; i<this.quotes.length; i++) {
              let triggerTime = new Date(moment(fixedDate).add((i+1)*timeGap, 'minutes').format());
              this.localNotifications.schedule({
                id: i,
                title: 'Gurmat Tuk',
                text: this.quotes[i].text,
                trigger: { at:  triggerTime},
                led: 'FFF000',
                sound: this.platform.is('android') ? 'file://assets/sounds/sound.mp3': 'file://assets/sounds/beep.caf',
                vibrate: true,
                icon: 'file://assets/imgs/icon.png'
              });
            }
          });
        }
      });
    });
    this.localNotifications.on('trigger').subscribe(x => this.onNotifTrig(x));
    this.localNotifications.on('click').subscribe(x => this.onNotifClick(x));
    this.localNotifications.on('clear').subscribe(x => this.onNotifClear(x));
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }


  onNotifTrig(notif) {
    console.log(notif);
  }
  onNotifClick(notif) {
    console.log("Notif Clicked", notif);
    this.storage.get('noOfNotifScheduled').then((noOfNotifScheduled) => {
      console.log(noOfNotifScheduled);
      noOfNotifScheduled++;
      this.storage.set('noOfNotifScheduled', noOfNotifScheduled);
    });
    this.localNotifications.getAll()
      .then(x => {
        console.log(x);
        console.log(x.length);
      })
  }
  onNotifClear(notif) {
    console.log("Notif Cleared", notif);
    this.storage.get('noOfNotifScheduled').then((noOfNotifScheduled) => {
      console.log(noOfNotifScheduled);
      noOfNotifScheduled = noOfNotifScheduled + 1;
      this.storage.set('noOfNotifScheduled', noOfNotifScheduled);
    });
    this.localNotifications.getAll()
      .then(x => {
        console.log(x);
        console.log(x.length);
      });
  }
}
