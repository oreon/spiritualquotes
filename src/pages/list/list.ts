import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { ItemDetailsPage } from '../item-details/item-details';
import { BaseFireService } from '../../base/BaseFireService';
import { Quote } from '../hello-ionic/hello-ionic';
import { Observable } from 'rxjs';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
const ALL_DATA = 'allData';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  icons: string[];
  //items: Array<{title: string, note: string, icon: string}>;
  items: Quote[];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private fireService :BaseFireService<Quote>,
    private network: Network,
    private storage: Storage
  ) {
    this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane',
    'american-football', 'boat', 'bluetooth', 'build'];

    console.log(network.type);
    console.log(network.Connection);
    if(!network.type || network.type === 'unknown' || network.type === 'none') {
      storage.get(ALL_DATA).then((quoteData) => {
        console.log('Quotes from local storage', quoteData);
        this.items = quoteData.quotes;
      }); 
    } else {
      this.fireService.getRecords().subscribe(quotes => {
        this.items = quotes;
        console.log(quotes);
        storage.get(ALL_DATA).then((quoteData) => {
          console.log('Quotes from local storage', quoteData);
          if(!quoteData) {
            quoteData = {};
          }
          quoteData.quotes = quotes;
          storage.set(ALL_DATA, quoteData);
        }); 
      })
    }
    // this.items = [];
    // for(let i = 1; i < 11; i++) {
    //   this.items.push({
    //     title: 'Item ' + i,
    //     note: 'This is item #' + i,
    //     icon: this.icons[Math.floor(Math.random() * this.icons.length)]
    //   });
    // }
  }

  itemTapped(event, item) {
    this.navCtrl.push(ItemDetailsPage, {
      item: item
    });
  }
}
