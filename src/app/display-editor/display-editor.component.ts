import { Component, OnInit, ViewChild } from '@angular/core';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-display-editor',
  templateUrl: './display-editor.component.html',
  styleUrls: ['./display-editor.component.css']
})
export class DisplayEditorComponent implements OnInit {
  public editorOptions: JsonEditorOptions;
  @ViewChild(JsonEditorComponent, { static: false }) editor: JsonEditorComponent;
  connectors;
  host = '';
  info;
  mode;

  constructor(private apiService: ApiService, private route: ActivatedRoute, private cookieService: CookieService) {
    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.modes = ['code', 'text', 'tree', 'view']; // set all allowed modes
    //this.options.mode = 'code'; //set only one mode
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.connectors = params.get('name');
      // console.log(this.connectors)    
    });

    const value = this.cookieService.get('connectorHost');
    if (value) {
      this.host = value;
    }
    else {
      this.host = '3.1.243.153:8083';
      this.cookieService.set('connectorHost', this.host);
    }

    this.route.url.subscribe(paths => {
      console.log('route', paths);
      if (paths.find(p => p.path === "status") != null) {
        this.mode = 'status';
      }
      else {
        this.mode = 'config';
      }

    });

    this.displayInfo();

  }

  displayInfo() {
    if (this.mode == 'config') {
      this.apiService.getInfo(this.host, this.connectors).subscribe((x) => {
        this.info = x;
      });
    }
    else {
      this.apiService.getStatusErrorInfo(this.host, this.connectors).subscribe((x) => {
        this.info = x;
      });

    }
  }


}
