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

  DEFAULT_SETTINGS = {noOfNotifs: 5, timeGap:60, startTime: moment({ hour:9, minute:0 }), endTime: moment({ hour:19, minute:0 })};

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

      if(this.platform.is('android')){
        if (!this.localNotifications.hasPermission())
          this.localNotifications.requestPermission();
      
      this.localNotifications.getAll()
      .then(x => {
        console.log(x);
        console.log(x.length);
        if(!x || x.length < this.DEFAULT_SETTINGS.noOfNotifs) {
          console.log("Here we are supposed to do some shit");
          this.storage.get('quotesData').then((quoteData) => {
            console.log('Quotes from local storage', quoteData);
            const timeGap = (quoteData && quoteData.timeGap) ? quoteData.timeGap : this.DEFAULT_SETTINGS.timeGap;
            const startTime = (quoteData && quoteData.startTime) ? quoteData.startTime : this.DEFAULT_SETTINGS.startTime;
            const endTime = (quoteData && quoteData.endTime) ? quoteData.endTime : this.DEFAULT_SETTINGS.endTime;
            let fixedDate = moment();

            if(x && x.length) {
              const max = x.reduce((prev, current) => (prev.id > current.id) ? prev : current);
              console.log(max);
              if(max && max.trigger && max.trigger.at){
                fixedDate = moment(max.trigger.at);
              }
            }

            console.log(fixedDate);
            if(quoteData && quoteData.quotes && quoteData.quotes.length) {
              if(quoteData.quoteNo < quoteData.quotes.length) {
                for(let i=quoteData.quoteNo; i < (quoteData.quoteNo + this.DEFAULT_SETTINGS.noOfNotifs); i++) {
                  if(i<quoteData.quotes.length) {
                    let triggerTime = moment(fixedDate).add(((i-quoteData.quoteNo)+1)*timeGap, 'minutes');                    
                    this.scheduleLocalNotif(i, quoteData.quotes[i].text, triggerTime, ((i-quoteData.quoteNo)+1)*timeGap, startTime, endTime);
                  }
                }
                quoteData.quoteNo += this.DEFAULT_SETTINGS.noOfNotifs;
                this.storage.set('quotesData', quoteData);
              } else {
                console.log("Gurbani Quotes in local storage finished. Please download more!");
              }
            } else {
              this.fireService.getRecords().subscribe(x => {
                console.log(x);
                this.quotes = x;
                this.storage.set('quotesData', {'quotes': this.quotes, quoteNo: this.DEFAULT_SETTINGS.noOfNotifs});
                for(let i=0; i < this.DEFAULT_SETTINGS.noOfNotifs; i++) {
                  let triggerTime = moment(fixedDate).add((i+1)*timeGap, 'minutes');
                  this.scheduleLocalNotif(i, this.quotes[i].text, triggerTime, (i+1)*timeGap, startTime, endTime);
                }
              });
            }
          });
        }
      });
    } else {
      console.log("We are on a browser!!");
    }
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }

  scheduleLocalNotif(i, quoteText, triggerTime, timeGap, startTime, endTime) {
    
    if (triggerTime.isBefore(startTime)) {
      triggerTime = moment(startTime);
      triggerTime.add(timeGap, 'minutes');
    } else if (triggerTime.isAfter(endTime)) {
      triggerTime = moment(startTime).add(1, 'days');
      triggerTime.add(timeGap, 'minutes');
    }

    console.log(triggerTime);

    this.localNotifications.schedule({
      id: i,
      title: 'Gurmat Tuk',
      text: quoteText,
      trigger: { at:  new Date(triggerTime.format())},
      led: 'FFF000',
      sound: this.platform.is('android') ? 'file://assets/sounds/sound.mp3': 'file://assets/sounds/beep.caf',
      vibrate: true,
      icon: 'file://assets/imgs/icon.png'
    });
  }

}
