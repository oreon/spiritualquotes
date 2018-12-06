import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuoteCardsPage } from './quote-cards';
import { SwingModule } from 'angular2-swing';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    QuoteCardsPage,
  ],
  imports: [
    HttpClientModule,
    SwingModule,
    IonicPageModule.forChild(QuoteCardsPage),
  ],
})
export class QuoteCardsPageModule {}
