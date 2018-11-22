import { Component } from '@angular/core';
import { Observable} from 'rxjs'
import { Platform, NavController } from 'ionic-angular';
import { BaseEntity } from '../../base/base-entity';
import { BaseFireService } from '../../base/BaseFireService';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SettingsProvider } from '../../providers/settings/settings';


export interface Quote extends BaseEntity{
  text:string
}

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {

  items: any[];
  public settingsForm: FormGroup;

  constructor(
    public navCtrl: NavController, 
    private fireService :BaseFireService<Quote>,
    public plt: Platform,
    private fb: FormBuilder,
    private settings:SettingsProvider
  ) {
    this.fireService.getRecords()
    .subscribe(
      x => this.items = x);
    this.createForm();
  }

  save(){
    console.log(this.settingsForm.value);
    this.settings.setSettings(this.settingsForm.value)
  }

  private createForm(): void {
    this.settingsForm = this.fb.group({
      start: ['9', []],
      end: ['7', []],
      freq: ['60', [Validators.required]],
    });
  }


}