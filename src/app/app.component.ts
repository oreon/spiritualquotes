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


const DEFAULT_SETTINGS = {noOfNotifs: 5, frequency:60, startTime: moment({ hour:9, minute:0 }), endTime: moment({ hour:19, minute:0 })};
const ALL_DATA = 'allData';


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
      { title: 'Settings', component: HelloIonicPage },
      { title: 'Quotes', component: ListPage }
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
        if(!x || x.length < DEFAULT_SETTINGS.noOfNotifs) {
          console.log("Here we are supposed to do some shit");
          this.storage.get(ALL_DATA).then((quoteData) => {
            console.log('Quotes from local storage', quoteData);
            const frequency = (quoteData && quoteData.frequency) ? quoteData.frequency : DEFAULT_SETTINGS.frequency;
            const startTime = (quoteData && quoteData.startTime) ? moment(quoteData.startTime, 'hh:mm') : DEFAULT_SETTINGS.startTime;
            const endTime = (quoteData && quoteData.endTime) ? moment(quoteData.endTime, 'hh:mm') : DEFAULT_SETTINGS.endTime;
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
                for(let i=quoteData.quoteNo; i < (quoteData.quoteNo + DEFAULT_SETTINGS.noOfNotifs); i++) {
                  if(i<quoteData.quotes.length) {
                    let triggerTime = moment(fixedDate).add(((i-quoteData.quoteNo)+1)*frequency, 'minutes');                    
                    this.scheduleLocalNotif(i, quoteData.quotes[i].text, triggerTime, ((i-quoteData.quoteNo)+1)*frequency, startTime, endTime);
                  }
                }
                quoteData.quoteNo += DEFAULT_SETTINGS.noOfNotifs;
                this.storage.set(ALL_DATA, quoteData);
              } else {
                console.log("Gurbani Quotes in local storage finished. Please download more!");
              }
            } else {
              this.fireService.getRecords().subscribe(x => {
                console.log(x);
                this.quotes = x;
                this.storage.set(ALL_DATA, {'quotes': this.quotes, quoteNo: DEFAULT_SETTINGS.noOfNotifs});
                for(let i=0; i < DEFAULT_SETTINGS.noOfNotifs; i++) {
                  let triggerTime = moment(fixedDate).add((i+1)*frequency, 'minutes');
                  this.scheduleLocalNotif(i, this.quotes[i].text, triggerTime, (i+1)*frequency, startTime, endTime);
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

  scheduleLocalNotif(i, quoteText, triggerTime, frequency, startTime, endTime) {
    
    if (triggerTime.isBefore(startTime)) {
      triggerTime = moment(startTime);
      triggerTime.add(frequency, 'minutes');
    } else if (triggerTime.isAfter(endTime)) {
      triggerTime = moment(startTime).add(1, 'days');
      triggerTime.add(frequency, 'minutes');
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
