import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ConnectorsComponent } from './connectors/connectors.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { DisplayEditorComponent } from './display-editor/display-editor.component';
import { NgJsonEditorModule } from 'ang-jsoneditor'
import { CookieService } from 'ngx-cookie-service';
import { DialogComponent } from './dialog/dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    ConnectorsComponent,
    DisplayEditorComponent,
    DialogComponent,
  ],
  entryComponents: [DialogComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    NgJsonEditorModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent],
})
export class AppModule { }
