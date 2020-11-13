
export interface Connector {
    state: string;
    worker_id: string;
}

export interface Task {
    id: number;
    state: string;
    worker_id: string;
}

export interface Status {
    name: string;
    connector: Connector;
    tasks: Task[];
    type: string;
}

// export interface Config {
//     "connector.class": string;
//     "transforms.unwrap.delete.handling.mode": string;
//     "tasks.max": string;
//     "database.history.kafka.topic": string;
//     "transforms": string;
//     "snapshot.delay.ms": string;
//     "include.schema.changes": string;
//     "table.whitelist": string;
//     "tombstones.on.delete": string;
//     "transforms.unwrap.type": string;
//     "database.encrypt": string;
//     "dialect.name": string;
//     "database.dbname": string;
//     "database.user": string;
//     "database.history.kafka.bootstrap.servers": string;
//     "database.server.name": string;
//     "snapshot.isolation.mode": string;
//     "database.port": string;
//     "key.converter.schemas.enable": string;
//     "value.converter.schema.registry.url": string;
//     "database.hostname": string;
//     "database.password": string;
//     "name": string;
//     "value.converter.schemas.enable": string;
//     "transforms.unwrap.add.fields": string;
//     "database.trustServerCertificate": string;
//     "transforms.unwrap.add.header": string;
//     "snapshot.mode": string;
// }

export interface Task {
    connector: string;
    task: number;
}

export interface ConnectorRootObject {
    name: string;
    config: Object;
    tasks: Task[];
    type: string;
}