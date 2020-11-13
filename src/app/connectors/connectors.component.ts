import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../api.service';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Status } from '../data/schema/connector';
import { MatSelectChange } from '@angular/material/select';

// export interface Element {
//   connectors: string;
//   status: string;
// }

@Component({
  selector: 'app-connectors',
  templateUrl: './connectors.component.html',
  styleUrls: ['./connectors.component.css']
})

export class ConnectorsComponent implements OnInit, OnDestroy {
  allSub: Subscription[] = [];
  connectors;
  connectorStatus: Status[] = [];
  host = '';
  connectorHostInput = '';

  //hold the name of the columns
  displayedColumns: string[] = ['select', 'position', 'connectors', 'connector_status', 'task_status', 'worker', 'action'];
  dataSource = new MatTableDataSource(this.connectorStatus);
  selection = new SelectionModel<Status>(true, []);

  // connector_Status: Status[] = [];
  selected = 'all';

  //'trgkafka01grcxstg.tranglo.net:8083';

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    const value = this.cookieService.get('connectorHost');

    if (value) {
      this.host = value;
      this.connectorHostInput = value;

      let getAllConnectorStatusSub = this.apiService.getAllConnectorStatus(this.host)
        .subscribe((res) => {
          if (res.status === 200) {
            // => https://stackoverflow.com/questions/37139772/want-to-split-one-single-json-objects-to-multiple-json-objects-using-javascript
            let item = res.body;
            Object.getOwnPropertyNames(res.body).forEach((val, idx, array) => {
              this.connectorStatus.push(item[val].status);
            });

            this.dataSource.data = this.connectorStatus;

            // console.log(this.dataSource.data);
          } else {
            this.openSnackBar(`getStatus failed. ${res.status}`, '');
          }
        }, (err: HttpErrorResponse) => {
          console.log({ "getStatus error": err });

          if (err.error)
            this.openSnackBar(`getStatus error. ${err.error.message}`, '');
        });

      this.allSub.push(getAllConnectorStatusSub);
    }
  }

  openDialog() {
    this.dialog.open(DialogComponent);
  }

  getAllStatus(): void {
    let getAllConnectorStatusSub = this.apiService.getAllConnectorStatus(this.host)
      .subscribe((res) => {
        if (res.status === 200) {
          // => https://stackoverflow.com/questions/37139772/want-to-split-one-single-json-objects-to-multiple-json-objects-using-javascript
          let item = res.body;
          Object.getOwnPropertyNames(res.body).forEach((val, idx, array) => {
            this.connectorStatus.push(item[val].status);
          });

          this.dataSource.data = this.connectorStatus;
        } else {
          this.openSnackBar(`getStatus failed. ${res.status}`, '');
        }
      }, (err: HttpErrorResponse) => {
        console.log({ "getStatus error": err });

        if (err.error)
          this.openSnackBar(`getStatus error. ${err.error.message}`, '');
      });

    this.allSub.push(getAllConnectorStatusSub);
  }

  selectedTaskStatus(evt: MatSelectChange) {
    let selectedValue: string = evt.value;
    let newArray: Status[] = [];

    //
    this.connectorStatus = [];
    this.dataSource.data = [];
    let getAllConnectorStatusSub = this.apiService.getAllConnectorStatus(this.host)
      .subscribe((res) => {
        if (res.status === 200) {
          let item = res.body;
          Object.getOwnPropertyNames(res.body).forEach((val, idx, array) => {
            this.connectorStatus.push(item[val].status);
          });

          if (selectedValue.toUpperCase() === 'ALL') {
            newArray = this.connectorStatus;
          } else if (selectedValue.toUpperCase() === 'UNDEFINED') {
            newArray = this.connectorStatus.filter(el => {
              return el.tasks[0]?.state === undefined;
            });
          } else {
            //#region Filter connector status
            // newArray = this.connectorStatus.filter(el => {
            //   // => https://stackoverflow.com/questions/2722159/how-to-filter-object-array-based-on-attributes
            //   return el.connector.state == selectedValue.toUpperCase();
            // });
            //#endregion

            //#region Filter connector task status
            newArray = this.connectorStatus.filter(el => {
              // => https://stackoverflow.com/questions/2722159/how-to-filter-object-array-based-on-attributes
              return el.tasks[0]?.state == selectedValue.toUpperCase();
            });
            //#endregion
          }

          this.dataSource.data = newArray;
        } else {
          this.openSnackBar(`getStatus failed. ${res.status}`, '');
        }
      }, (err: HttpErrorResponse) => {
        console.log({ "getStatus error": err });

        if (err.error)
          this.openSnackBar(`getStatus error. ${err.error.message}`, '');
      });

    this.allSub.push(getAllConnectorStatusSub);
    //
  }

  // TODO: Add check connector status function
  checkTasksStatus(connectorid) {
    let tmpArr = [...this.connectorStatus];
    let tasksArr = tmpArr.find(ea => ea.name === connectorid).tasks;
    let boolean = true;
    for (let i = 0; i < tasksArr.length; i++) {
      if (tasksArr[i].state === 'FAILED') {
        boolean = false;
      }
    }
    return boolean;
  }

  // TODO: Update function to check on task status
  checkTasksStatusIsRunning(connectorid) {
    let tmpArr = [...this.connectorStatus];
    let boolean = false;
    let state = tmpArr.find(ea => ea.name === connectorid).connector.state;
    if (state === 'RUNNING') {
      boolean = true;
    }
    return boolean;
  }

  deleteConnector(connectorid: string) {
    if (confirm(`Confirm to delete '${connectorid}' connector ?`)) {
      // console.log(`delete ${connectorid}`);

      let deleteConnectorSub = this.apiService.deleteConnector(this.host, connectorid)
        .subscribe((res) => {
          if (res.status === 204) {
            let getAllConnectorStatusSub = this.apiService.getAllConnectorStatus(this.host)
              .subscribe((res) => {
                if (res.status === 200) {
                  this.resetAll();
                  // this.connectorStatus = [];
                  // this.dataSource.data = [];

                  let item = res.body;
                  Object.getOwnPropertyNames(res.body).forEach((val, idx, array) => {
                    this.connectorStatus.push(item[val].status);
                  });

                  this.dataSource.data = this.connectorStatus;
                  // this.selected = 'all';

                  this.openSnackBar('Connector deleted successfully.', '');
                } else {
                  this.openSnackBar(`getStatus failed. ${res.status}`, '');
                }
              }, (err: HttpErrorResponse) => {
                console.log({ "getStatus error": err });

                if (err.error)
                  this.openSnackBar(`getStatus error. ${err.error.message}`, '');
              });

            this.allSub.push(getAllConnectorStatusSub);
          } else {
            this.openSnackBar(`deleteConnector error. ${res.status}`, '');
          }
        }, (err: HttpErrorResponse) => {
          console.log({ "deleteConnector error": err });

          if (err.error)
            this.openSnackBar(`deleteConnector error. ${err.error.message}`, '');
        });

      this.allSub.push(deleteConnectorSub);
    }
  }

  getTaskWorker(connectorid) {
    let tmpArr = [...this.connectorStatus];
    let tasks = tmpArr.find(ea => ea.name === connectorid).tasks;
    return Array.prototype.map.call(tasks, function (item) { return item.worker_id; }).join(",");
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  clickStart(connectorid): void {
    let startConnectorSub = this.apiService.startConnector(this.host, connectorid)
      .subscribe((x) => {
        if (x.status === 202) {
          let getAllConnectorStatusSub = this.apiService.getAllConnectorStatus(this.host)
            .subscribe((res) => {
              if (res.status === 200) {
                this.resetAll();
                // this.connectorStatus = [];
                // this.dataSource.data = [];

                let item = res.body;
                Object.getOwnPropertyNames(res.body).forEach((val, idx, array) => {
                  this.connectorStatus.push(item[val].status);
                });

                this.dataSource.data = this.connectorStatus;
                // this.selected = 'all';

                this.openSnackBar('Connector start successful.', '');

                let tmpArr = [...this.connectorStatus];
                tmpArr.find(ea => ea.name === connectorid).connector.state = 'RUNNING';
                tmpArr.find(ea => ea.name === connectorid).tasks[0].state = 'RUNNING';
              } else {
                this.openSnackBar(`getStatus failed. ${res.status}`, '');
              }
            }, (err: HttpErrorResponse) => {
              console.log({ "getStatus error": err });

              if (err.error)
                this.openSnackBar(`getStatus error. ${err.error.message}`, '');
            });

          this.allSub.push(getAllConnectorStatusSub);
        }
      });

    this.allSub.push(startConnectorSub);
  }

  clickPause(connectorid): void {
    let pauseConnectorSub = this.apiService.pauseConnector(this.host, connectorid).subscribe((x) => {
      if (x.status === 202) {
        let getAllConnectorStatusSub = this.apiService.getAllConnectorStatus(this.host)
          .subscribe((res) => {
            if (res.status === 200) {
              this.resetAll();
              // this.connectorStatus = [];
              // this.dataSource.data = [];

              let item = res.body;
              Object.getOwnPropertyNames(res.body).forEach((val, idx, array) => {
                this.connectorStatus.push(item[val].status);
              });

              this.dataSource.data = this.connectorStatus;
              // this.selected = 'all';

              this.openSnackBar('Connector pause successful.', '');

              let tmpArr = [...this.connectorStatus];
              tmpArr.find(ea => ea.name === connectorid).connector.state = 'PAUSED';
              tmpArr.find(ea => ea.name === connectorid).tasks[0].state = 'PAUSED';
            } else {
              this.openSnackBar(`getStatus failed. ${res.status}`, '');
            }
          }, (err: HttpErrorResponse) => {
            console.log({ "getStatus error": err });

            if (err.error)
              this.openSnackBar(`getStatus error. ${err.error.message}`, '');
          });

        this.allSub.push(getAllConnectorStatusSub);
      }
    });

    this.allSub.push(pauseConnectorSub);
  }

  clickRestartConnector(connectorid: string): void {
    let restartConnectorSub = this.apiService.restartConnector(this.host, connectorid)
      .subscribe((res) => {
        if (res.status === 204) {
          let getAllConnectorStatusSub = this.apiService.getAllConnectorStatus(this.host)
            .subscribe((res) => {
              if (res.status === 200) {
                this.resetAll();
                // this.connectorStatus = [];
                // this.dataSource.data = [];

                let item = res.body;
                Object.getOwnPropertyNames(res.body).forEach((val, idx, array) => {
                  this.connectorStatus.push(item[val].status);
                });

                this.dataSource.data = this.connectorStatus;
                // this.selected = 'all';

                this.openSnackBar('Connector restart successful.', '');

                // let tmpArr = [...this.connectorStatus];
                // tmpArr.find(ea => ea.name === connectorid).connector.state = 'RUNNING';
              } else {
                this.openSnackBar(`getStatus failed. ${res.status}`, '');
              }
            }, (err: HttpErrorResponse) => {
              console.log({ "getStatus error": err });

              if (err.error)
                this.openSnackBar(`getStatus error. ${err.error.message}`, '');
            });

          this.allSub.push(getAllConnectorStatusSub);
        } else {
          this.openSnackBar(`selectConnectorRestart error. ${res.status}`, '');
        }
      }, (err: HttpErrorResponse) => {
        console.log({ "selectConnectorRestart error": err });

        if (err.error)
          this.openSnackBar(`selectConnectorRestart error. ${err.error.message}`, '');
      });

    this.allSub.push(restartConnectorSub);
  }

  clickRestartTask(connectorid: string): void {
    let restartConnectorByTaskNumberSub = this.apiService.restartConnectorByTaskNumber(this.host, connectorid)
      .subscribe((res) => {
        if (res.status === 204) {
          let getAllConnectorStatusSub = this.apiService.getAllConnectorStatus(this.host)
            .subscribe((res) => {
              if (res.status === 200) {
                this.resetAll();
                // this.connectorStatus = [];
                // this.dataSource.data = [];

                let item = res.body;
                Object.getOwnPropertyNames(res.body).forEach((val, idx, array) => {
                  this.connectorStatus.push(item[val].status);
                });

                this.dataSource.data = this.connectorStatus;
                // this.selected = 'all';

                this.openSnackBar('Task restart successful.', '');

                // let tmpArr = [...this.connectorStatus];
                // tmpArr.find(ea => ea.name === connectorid).connector.state = 'RUNNING';
              } else {
                this.openSnackBar(`getStatus failed. ${res.status}`, '');
              }
            }, (err: HttpErrorResponse) => {
              console.log({ "getStatus error": err });

              if (err.error)
                this.openSnackBar(`getStatus error. ${err.error.message}`, '');
            });

          this.allSub.push(getAllConnectorStatusSub);
        } else {
          this.openSnackBar(`clickRestartTask error. ${res.status}`, '');
        }
      }, (err: HttpErrorResponse) => {
        console.log({ "clickRestartTask error": err });

        if (err.error)
          this.openSnackBar(`clickRestartTask error. ${err.error.message}`, '');
      });

    this.allSub.push(restartConnectorByTaskNumberSub);
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms || 1000));
  }

  selectPause(): void {
    this.selection.selected.forEach((selected, key, arr) => {
      let connectorid = selected["name"];
      let pauseConnectorSub = this.apiService.pauseConnector(this.host, connectorid).subscribe(async (response) => {

        if (Object.is(arr.length - 1, key) && response.status === 202) {
          // execute last item logic => https://stackoverflow.com/questions/29738535/catch-foreach-last-iteration
          // console.log(`Last callback call at index ${key} with value ${selected}`);
          await this.sleep(100);
          let getAllConnectorStatusSub = this.apiService.getAllConnectorStatus(this.host)
            .subscribe((res) => {
              if (res.status === 200) {
                this.resetAll();
                // this.connectorStatus = [];
                // this.dataSource.data = [];

                let item = res.body;
                Object.getOwnPropertyNames(res.body).forEach((val, idx, array) => {
                  this.connectorStatus.push(item[val].status);
                });

                this.dataSource.data = this.connectorStatus;
                // this.selected = 'all';

                this.openSnackBar('Connector pause successful.', '');
              } else {
                this.openSnackBar(`getStatus failed. ${res.status}`, '');
              }
            }, (err: HttpErrorResponse) => {
              console.log({ "getStatus error": err });

              if (err.error)
                this.openSnackBar(`getStatus error. ${err.error.message}`, '');
            });

          this.allSub.push(getAllConnectorStatusSub);
        }
      })

      this.allSub.push(pauseConnectorSub);
    });
  }

  selectStart(): void {
    this.selection.selected.forEach((selected, key, arr) => {
      let connectorid = selected["name"];
      let startConnectorSub = this.apiService.startConnector(this.host, connectorid).subscribe(async (response) => {

        if (Object.is(arr.length - 1, key) && response.status === 202) {
          await this.sleep(100);

          let getAllConnectorStatusSub = this.apiService.getAllConnectorStatus(this.host)
            .subscribe((res) => {
              if (res.status === 200) {
                this.resetAll();
                // this.connectorStatus = [];
                // this.dataSource.data = [];

                let item = res.body;
                Object.getOwnPropertyNames(res.body).forEach((val, idx, array) => {
                  this.connectorStatus.push(item[val].status);
                });

                this.dataSource.data = this.connectorStatus;
                // this.selected = 'all';

                this.openSnackBar('Connector start successful.', '');
              } else {
                this.openSnackBar(`getStatus failed. ${res.status}`, '');
              }
            }, (err: HttpErrorResponse) => {
              console.log({ "getStatus error": err });

              if (err.error)
                this.openSnackBar(`getStatus error. ${err.error.message}`, '');
            });

          this.allSub.push(getAllConnectorStatusSub);
        }
      })

      this.allSub.push(startConnectorSub);
    });
  }

  selectConnectorRestart(): void {
    this.selection.selected.forEach((selected, key, arr) => {
      let connectorid = selected["name"];
      let restartConnectorSub = this.apiService.restartConnector(this.host, connectorid).subscribe(async (response) => {

        if (Object.is(arr.length - 1, key) && response.status === 204) {
          await this.sleep(100);

          let getAllConnectorStatusSub = this.apiService.getAllConnectorStatus(this.host)
            .subscribe((res) => {
              if (res.status === 200) {
                this.resetAll();
                // this.connectorStatus = [];
                // this.dataSource.data = [];

                let item = res.body;
                Object.getOwnPropertyNames(res.body).forEach((val, idx, array) => {
                  this.connectorStatus.push(item[val].status);
                });

                this.dataSource.data = this.connectorStatus;
                // this.selected = 'all';

                this.openSnackBar('Connector restart successful.', '');
              } else {
                this.openSnackBar(`getStatus failed. ${res.status}`, '');
              }
            }, (err: HttpErrorResponse) => {
              console.log({ "getStatus error": err });

              if (err.error)
                this.openSnackBar(`getStatus error. ${err.error.message}`, '');
            });

          this.allSub.push(getAllConnectorStatusSub);
        } else if (response.status !== 204) {
          this.openSnackBar(`selectConnectorRestart error. ${response.status}`, '');
        }
      }, (err: HttpErrorResponse) => {
        console.log({ "selectConnectorRestart error": err });

        if (err.error)
          this.openSnackBar(`selectConnectorRestart error. ${err.error.message}`, '');
      });
      this.allSub.push(restartConnectorSub);
    });
  }

  selectTaskRestart(): void {
    this.selection.selected.forEach(async (selected, key, arr) => {
      let connectorid = selected["name"];

      let restartConnectorByTaskNumberSub = this.apiService.restartConnectorByTaskNumber(this.host, connectorid).subscribe(async (response: HttpResponse<any>) => {

        if (Object.is(arr.length - 1, key) && response.status === 204) {
          await this.sleep(100);

          let getAllConnectorStatusSub = this.apiService.getAllConnectorStatus(this.host)
            .subscribe((res) => {
              if (res.status === 200) {
                this.resetAll();
                // this.connectorStatus = [];
                // this.dataSource.data = [];

                let item = res.body;
                Object.getOwnPropertyNames(res.body).forEach((val, idx, array) => {
                  this.connectorStatus.push(item[val].status);
                });

                this.dataSource.data = this.connectorStatus;
                // this.selected = 'all';

                this.openSnackBar('Task restart successful.', '');
              } else {
                this.openSnackBar(`getStatus failed. ${res.status}`, '');
              }
            }, (err: HttpErrorResponse) => {
              console.log({ "getStatus error": err });

              if (err.error)
                this.openSnackBar(`getStatus error. ${err.error.message}`, '');
            });

          this.allSub.push(getAllConnectorStatusSub);
        } else if (response.status !== 204) {
          this.openSnackBar(`selectTaskRestart error. ${response.status}`, '');
        }
      }, (err: HttpErrorResponse) => {
        console.log({ "selectTaskRestart error": err });
        if (err.error)
          this.openSnackBar(`selectTaskRestart error. ${err.error.message}`, '');
      });
      this.allSub.push(restartConnectorByTaskNumberSub);
    });
  }

  clickChangeHost(host: string) {
    this.apiService.checkConnection(host).toPromise().then(x => {
      if (x.status === 200) {
        this.resetAll();
        // this.connectorStatus = [];
        // this.dataSource.data = [];
        this.dataSource.data.length = 0;
        this.host = host;
        this.cookieService.set('connectorHost', host);

        let getAllConnectorStatusSub = this.apiService.getAllConnectorStatus(this.host)
          .subscribe((res) => {
            if (res.status === 200) {
              // => https://stackoverflow.com/questions/37139772/want-to-split-one-single-json-objects-to-multiple-json-objects-using-javascript
              let item = res.body;
              Object.getOwnPropertyNames(res.body).forEach((val, idx, array) => {
                this.connectorStatus.push(item[val].status);
              });

              this.dataSource.data = this.connectorStatus;
              // this.selected = 'all';
            } else {
              this.openSnackBar(`getStatus failed. ${res.status}`, '');
            }
          }, (err: HttpErrorResponse) => {
            console.log({ "getStatus error": err });

            if (err.error)
              this.openSnackBar(`getStatus error. ${err.error.message}`, '');
          });

        this.allSub.push(getAllConnectorStatusSub);
      }
    }).catch(err => {
      console.log(err);
      this.openDialog();
    }
    );
  }

  //check for selection
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  //select all or clear all selection
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  //The label for the checkbox on the passed row
  checkboxLabel(row?: Status): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} `;
  }

  resetAll() {
    this.connectorStatus = [];
    this.dataSource.data = [];
    this.dataSource.data.length = 0;
    this.selected = 'all';
    this.selection.clear();
  }

  testGetConnectorInfo(connectorid: string) {
    let getConnectorInfoSub = this.apiService.getConnectorInfo(this.host, connectorid)
      .subscribe((res) => {
        console.log(res);
        if (res.status === 200) {
          if (res.body.type === 'source') {

            console.log(res.body.config["database.server.name"]);
            alert(`database.server.name: ${res.body.config["database.server.name"]}`)

          } else if (res.body.type === 'sink') {

            console.log(res.body.config["topics"]);
            alert(`topics: ${res.body.config["topics"]}`)
          }

          // this.openSnackBar('testGetConnectorInfo successful.', '');
        } else {
          this.openSnackBar(`testGetConnectorInfo error. ${res.status}`, '');
        }
      }, (err: HttpErrorResponse) => {
        console.log({ "testGetConnectorInfo error": err });

        if (err.error)
          this.openSnackBar(`testGetConnectorInfo error. ${err.error.message}`, '');
      });

    this.allSub.push(getConnectorInfoSub);
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }

  ngOnDestroy() {
    for (let sub of this.allSub) {
      sub.unsubscribe();
    }
  }
}
