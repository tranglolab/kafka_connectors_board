import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { of, Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ConnectorRootObject, Status } from './data/schema/connector';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  observe: 'response'
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  //initialize
  // host;

  constructor(private httpClient: HttpClient) { }

  public checkConnection(host: string) {
    return this.httpClient.get(`http://${host}/connectors`, { observe: 'response' });
  }

  public getConnectors(host: string) {
    return this.httpClient.get(`http://${host}/connectors`);
  }

  public getInfo(host: string, connector: string) {
    return this.httpClient.get(`http://${host}/connectors/${connector}`);
  }

  public getConnectorInfo(host: string, connector: string): Observable<HttpResponse<ConnectorRootObject>> {
    return this.httpClient
      .get<any>(
        `http://${host}/connectors/${connector}`,
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          observe: 'response'
        }
      )
      .pipe(map(data => {
        return data;
      }));
  }

  public getStatusErrorInfo(host: string, connector: string) {
    return this.httpClient.get(`http://${host}/connectors/${connector}/status`);
  }

  public getStatus(host: string, connector: string) {
    return this.httpClient.get(`http://${host}/connectors/${connector}/status`);
  }

  public pauseConnector(host: string, connector: string) {
    return this.httpClient.put(`http://${host}/connectors/${connector}/pause`, {}, { observe: 'response' });
  }

  public startConnector(host: string, connector: string) {
    return this.httpClient.put(`http://${host}/connectors/${connector}/resume`, {}, { observe: 'response' });
  }
  public clickRestart(host: string, connector: string) {
    return this.httpClient.post(`http://${host}/connectors/${connector}/tasks/0/restart`, {}, { observe: 'response' });
  }

  public restartConnector(host: string, connector: string): Observable<HttpResponse<any>> {
    return this.httpClient
      .post<any>(
        `http://${host}/connectors/${connector}/restart`,
        {},
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          observe: 'response'
        }
      )
      .pipe(map(response => {
        return response;
      }));
  }

  public restartConnectorByTaskNumber(host: string, connector: string, taskNumber: number = 0): Observable<HttpResponse<any>> {
    return this.httpClient
      .post<any>(
        `http://${host}/connectors/${connector}/tasks/${taskNumber}/restart`,
        {},
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          observe: 'response'
        })
      .pipe(map(response => {
        return response;
      }));
  }

  public deleteConnector(host: string, connector: string): Observable<HttpResponse<any>> {
    return this.httpClient
      .delete<any>(
        `http://${host}/connectors/${connector}`,
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          observe: 'response'
        }
      )
      .pipe(map(response => {
        return response;
      }));
  }

  public getAllConnectorStatus(host: string): Observable<HttpResponse<any>> {
    return this.httpClient
      .get<any>(
        `http://${host}/connectors/?expand=status`,
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          observe: 'response'
        }
      )
      .pipe(map(data => {
        return data;
      }));
  }
}