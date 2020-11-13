# Kafka connector board (KCB)
Kafka connector board is an utility application that helps you to view the status and manage the your connectors deployed in the kafka cluster.With KCB, you can search the connectors
by name or filtering the list by status.You can also perform operations such as start, stop, restart tasks of the selected connector tasks in bulk.

It is built with Angular and consuming the rest api from kafka connect rest service.

### Prerequisites

### Nodejs & NPM
KCB runs on Angular and requires current [Node.js](https://nodejs.org/) v10+ to run.
Follow the instruction from offical Nodejs and install the Nodejs and NPM package manager. Run the node -v in a terminal window. Ensure you have already installed the NPM package manager.

```sh
$ npm -v
```
### Angular
To install the Angular CLI, open a terminal window and run the following command:
```sh
$ npm install -g @angular/cli
```

### To run the app
Navigate to your working directory

```sh
$ git clone https://github.com/tranglolab/kafka_connectors_board.git
$ cd src
$ npm install
$ ng serve -o
```
Open your browser and navigate to http://localhost:4200/, you should have the KCB running.

![image](https://user-images.githubusercontent.com/73549377/99041792-8f212b00-25c6-11eb-8f14-aaf79dd0302e.png)

Key in Kafka Connect REST API Host (eg: localhost:8083)  on host field and click connect.

![image](https://user-images.githubusercontent.com/73549377/99066642-3e202f80-25e4-11eb-8ca2-6900fe94051f.png)


## Some notes

Please make sure you have enabled the CORS on the Kafka Connect Rest API 
