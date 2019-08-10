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
import { QuoteCardsPage } from '../pages/quote-cards/quote-cards';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';


const DEFAULT_SETTINGS = {noOfNotifs: 5, frequency:60, startTime: moment({ hour:7, minute:0 }), endTime: moment({ hour:19, minute:0 })};
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
    private backgroundMode: BackgroundMode
  ) {
    //this.initializeApp();

    this.platform.ready().then(() => {
      if(this.platform.is('android') || this.platform.is('ios')){
        this.backgroundMode.enable();
      }
    });

    this.localNotifications.schedule({
      text: ' please breathe deep  ',
       //trigger: { every: { minute: 1 }, count: 500 }, => not working 
       trigger: {at: new Date(new Date().getTime() + 6000)}, 
       led: 'FF0000',
       sound: null
   });


    // set our app's pages
    this.pages = [
      { title: 'Settings', component: HelloIonicPage },
      { title: 'Quotes', component: ListPage },
      { title: 'QuoteCards', component: QuoteCardsPage }
    ];
  }

  isBGActive(){
    if(this.platform.is('android')){
      return this.backgroundMode.isActive();
    }else 
    return true;
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
      if(this.platform.is('android') || this.platform.is('ios')){
      this.backgroundMode.enable();
      }
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
         
          this.storage.get(ALL_DATA).then((quoteData) => {
            console.log('Quotes from local storage', quoteData);
            const frequency = (quoteData && quoteData.frequency) ? quoteData.frequency : DEFAULT_SETTINGS.frequency;
            const startTime = (quoteData && quoteData.start) ? moment(quoteData.start, 'hh:mm') : DEFAULT_SETTINGS.startTime;
            const endTime = (quoteData && quoteData.end) ? moment(quoteData.end, 'hh:mm') : DEFAULT_SETTINGS.endTime;
            let startTimeTrigger = moment(startTime).add(1, 'days');
            if(moment().isBefore(startTime)){
              startTimeTrigger = moment(startTime);
            }
            var duration = moment.duration(endTime.diff(moment()));
            DEFAULT_SETTINGS.noOfNotifs = Math.floor(duration.asHours());
            console.log("Number of notifs nikal rahe ", moment(), endTime, moment().isAfter(endTime));
            if (moment().isBefore(startTime) || moment().isAfter(endTime)) {
              DEFAULT_SETTINGS.noOfNotifs = 0;
            }
            console.log("Number of notifs - ", DEFAULT_SETTINGS.noOfNotifs, startTimeTrigger);
            let fixedDate = moment();
            let maxNotifDate = null;

            if(x && x.length) {
              const max = x.reduce((prev, current) => (prev.id > current.id) ? prev : current);
              console.log(max);
              if(max && max.trigger && max.trigger.at){
                maxNotifDate = moment(max.trigger.at);
              }
            }

            console.log("Dates - ", fixedDate, maxNotifDate);
            if(!maxNotifDate || maxNotifDate.isBefore(moment())){
            if(quoteData && quoteData.quotes && quoteData.quotes.length) {
              if(quoteData.quoteNo < quoteData.quotes.length) {
                for(let i=quoteData.quoteNo; i < (quoteData.quoteNo + DEFAULT_SETTINGS.noOfNotifs); i++) {
                  if(i<quoteData.quotes.length) {
                    let triggerTime = moment(fixedDate).add(((i-quoteData.quoteNo)+1)*frequency, 'minutes');                    
                    this.scheduleLocalNotif(i, quoteData.quotes[i], triggerTime);
                  }
                }
                this.scheduleLocalNotif(DEFAULT_SETTINGS.noOfNotifs, quoteData.quotes[quoteData.quoteNo + DEFAULT_SETTINGS.noOfNotifs], startTimeTrigger);
                quoteData.quoteNo += DEFAULT_SETTINGS.noOfNotifs + 1;
                this.storage.set(ALL_DATA, quoteData);
              } else {
                for(let i=0; i < DEFAULT_SETTINGS.noOfNotifs; i++) {
                  if(i<quoteData.quotes.length) {
                    let triggerTime = moment(fixedDate).add((i+1)*frequency, 'minutes');                    
                    this.scheduleLocalNotif(i, quoteData.quotes[i], triggerTime);
                  }
                }
                this.scheduleLocalNotif(DEFAULT_SETTINGS.noOfNotifs, quoteData.quotes[DEFAULT_SETTINGS.noOfNotifs], startTimeTrigger);
                quoteData.quoteNo += DEFAULT_SETTINGS.noOfNotifs + 1;
                this.storage.set(ALL_DATA, quoteData);
              }
            } else {
              this.fireService.getRecords().subscribe(x => {

                console.log("Quotes - ", x);
                this.quotes = x;
                if(!quoteData) {
                  this.storage.set(ALL_DATA, {'quotes': this.quotes, quoteNo: DEFAULT_SETTINGS.noOfNotifs+1});
                } else {
                  quoteData.quotes = this.quotes;
                  quoteData.quoteNo = DEFAULT_SETTINGS.noOfNotifs+1;
                  this.storage.set(ALL_DATA, quoteData);
                }
                for(let i=0; i < DEFAULT_SETTINGS.noOfNotifs; i++) {
                  let triggerTime = moment(fixedDate).add((i+1)*frequency, 'minutes');
                  this.scheduleLocalNotif(i, this.quotes[i], triggerTime);
                }
                this.scheduleLocalNotif(DEFAULT_SETTINGS.noOfNotifs, this.quotes[DEFAULT_SETTINGS.noOfNotifs], startTimeTrigger);
              });
            }
          }
          });
      });
      this.localNotifications.on('click').subscribe(notif => {
        console.log(notif);
      })
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

  scheduleLocalNotif(i, quote, triggerTime) {
    
    // if (triggerTime.isBefore(startTime)) {
    //   triggerTime = moment(startTime);
    //   triggerTime.add(frequency, 'minutes');
    // } else if (triggerTime.isAfter(endTime)) {
    //   triggerTime = moment(startTime).add(1, 'days');
    //   triggerTime.add(frequency, 'minutes');
    // }

    console.log("Notif schedule kar rahe - ",i, quote, triggerTime);

    this.localNotifications.schedule({
      id: i,
      title: 'Gurmat Tuk',
      text: quote.text,
      trigger: { at:  new Date(triggerTime.format())},
      led: 'FFF000',
      sound: this.platform.is('android') ? 'file://assets/sounds/sound.mp3': 'file://assets/sounds/beep.caf',
      vibrate: true,
      icon: 'file://assets/imgs/icon.png',
      data: quote
    });
  }

}
