import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { Platform, NavController } from "ionic-angular";
import { BaseEntity } from "../../base/base-entity";
import { BaseFireService } from "../../base/BaseFireService";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { SettingsProvider } from "../../providers/settings/settings";
import { LocalNotifications } from "@ionic-native/local-notifications";

export interface Quote extends BaseEntity {
  text: string;
}

@Component({
  selector: "page-hello-ionic",
  templateUrl: "hello-ionic.html"
})
export class HelloIonicPage {
  items: any[];
  public settingsForm: FormGroup;

  constructor(
    public platform: Platform,    
    private localNotifications: LocalNotifications,
    public navCtrl: NavController,
    private fireService: BaseFireService<Quote>,
    public plt: Platform,
    private fb: FormBuilder,
    private settings: SettingsProvider
  ) {
    this.createForm();

    this.settings.getSettings().then(x => {
      console.log(this.settingsForm.value.start);
      console.log("X - ", x);
      if(x){
        this.settingsForm.get("start").setValue(x["start"]);
        this.settingsForm.get("end").setValue(x["end"]);
        this.settingsForm.get("frequency").setValue(x["frequency"]);
      }
    });
    this.platform.ready().then(() => {
      if(this.platform.is('android')){
        console.log("Hello ionic file mein chal raha");
        this.localNotifications.getAll()
        .then(x => {
          console.log(x);
          console.log(x.length);
          this.items = x;
        })
      }
    })
  }

  save() {
    console.log(this.settingsForm.value);
    this.settings.setSettings(this.settingsForm.value);
  }

  private createForm(): void {
    this.settingsForm = this.fb.group({
      start: ["9", []],
      end: ["7", []],
      frequency: ["60", [Validators.required]]
    });
  }
}
