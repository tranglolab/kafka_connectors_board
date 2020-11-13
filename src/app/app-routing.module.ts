import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DisplayEditorComponent } from './display-editor/display-editor.component';
import { ConnectorsComponent } from './connectors/connectors.component';


const routes: Routes = [
  { path: '', component: ConnectorsComponent, pathMatch: 'full'  },
  { path: 'display-editor/:name', component: DisplayEditorComponent },
  { path: 'display-editor/:name/status', component: DisplayEditorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
