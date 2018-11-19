import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import { LocalNotifications } from '@ionic-native/local-notifications'

import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule, AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { BaseFireService } from '../base/BaseFireService';
import { FirestoreService } from '../base/firestore.service';

var config = {
  apiKey: "AIzaSyCTyxpg77b9mj-PTAvqLnwzjXlmsInLBkk",
  authDomain: "spritiualquotes.firebaseapp.com",
  databaseURL: "https://spritiualquotes.firebaseio.com",
  projectId: "spritiualquotes",
  storageBucket: "",
  messagingSenderId: "363011445349"
};

export const firebaseConfig = {
  apiKey: "AIzaSyC1lhQgXW-08ttzTrSktVvNTFCA1HVLpw4",
  authDomain: "aid4kids-ed95a.firebaseapp.com",
  databaseURL: "https://aid4kids-ed95a.firebaseio.com",
  projectId: "aid4kids-ed95a",
  storageBucket: "aid4kids-ed95a.appspot.com",
  messagingSenderId: "776583101410"
}

@NgModule({
  declarations: [
    MyApp,
    HelloIonicPage,
    ItemDetailsPage,
    ListPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),    
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HelloIonicPage,
    ItemDetailsPage,
    ListPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    LocalNotifications,
    AngularFireDatabase,
    BaseFireService,
    FirestoreService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
