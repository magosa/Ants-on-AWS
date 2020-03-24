/**
Application : dashboard
Description : ダッシュボードのサーバサイドJavascriptです。
Version : 1.0.0
Dependencies : node.js + Express + Socket.io + PostgresQL
Auther : Magosa
**/

const ROUTER_SERVER_ADDRESS = 'http://172.22.2.109:8080';
const HTTP_PORT_NO = process.env.PORT || 8000;
const REDIS_HOST_NAME = '172.22.2.109';
const REDIS_PORT_NO = 6379;


const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const http = require('http').Server(app);
const fs = require('fs');
const front_io = require('socket.io')(http);
const backend_io = require('socket.io-client')(ROUTER_SERVER_ADDRESS);
const redis = require('redis');

//Raw data サンプリング用
let buffer;

// 接続
let client = redis.createClient(REDIS_PORT_NO, REDIS_HOST_NAME);
client.on('connect', () => console.log('redis connect'));
client.on('error', err => console.log('error：' + err));


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  next();
});

app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(bodyparser.json());

app.options('*', (req, res) => {
  res.sendStatus(200);
});

app.use(express.static(__dirname + '/'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

backend_io.on('connect', () => {
  console.log('websocket router connect!');
  backend_io.on('routing_data', sensor_data => {
    front_io.emit('sensor_data', sensor_data);
    buffer = sensor_data;
  });
});

app.get('/heatmap/', function(req, res) {
  if (buffer) {
    res.json(buffer);
  }
});

// app.get('/footprints/', function(req, res) {
//   // let dataset = [
//   //   { id: "1", x: 13728, y: 5728 },
//   //   { id: "1", x: 13828, y: 3728 },
//   //   { id: "2", x: 9728, y: 3728 },
//   //   { id: "2", x: 9557, y: 3828 },
//   //   { id: "3", x: 8928, y: 3728 },
//   //   { id: "4", x: 3728, y: 728 },
//   //   { id: "4", x: 3899, y: 5728 },
//   //   { id: "4", x: 3278, y: 7020 }
//   // ]
//   // res.json(dataset);
//   const sql = "SELECT id, x, y FROM raw_data WHERE unixtime > extract(epoch from (CURRENT_TIMESTAMP - INTERVAL '3 hour')) ORDER BY id ASC, unixtime DESC;";
//   // const sql = "SELECT id, x, y FROM raw_data WHERE unixtime > extract(epoch from (CURRENT_TIMESTAMP - INTERVAL '30 minute')) ORDER BY id ASC, unixtime DESC;";
//   // const sql = "SELECT id, x, y FROM raw_data WHERE unixtime > extract(epoch from (CURRENT_TIMESTAMP - INTERVAL '1 second')) ORDER BY id ASC, unixtime DESC;";
//
//   client.query(sql, (err, resql) => {
//     if (err) {
//       console.log(err);
//     };
//     res.json(resql.rows);
//   });
// });

app.get('/all-count/', function(req, res) {
  // let dataset = [
  //   { value: 13728 }
  // ]
  // res.json(dataset);
  client.get('all-count', (err, reply) => {
    res.json(JSON.parse(reply));
  });
});

app.get('/intrusion-count/', function(req, res) {
  // let dataset = [
  //   { area: "A", value: 24 },
  //   { area: "B", value: 45 },
  //   { area: "C", value: 3 },
  //   { area: "D", value: 26 },
  //   { area: "E", value: 8 },
  //   { area: "F", value: 19 }
  // ]
  // res.json(dataset);
  client.get('intrusion-count', (err, reply) => {
    res.json(JSON.parse(reply));
  });
});

app.get('/intersect-count/', function(req, res) {
  // let dataset = [
  //   { line: "A", value: 24 },
  //   { line: "B", value: 45 },
  //   { line: "C", value: 3 },
  //   { line: "D", value: 26 },
  //   { line: "E", value: 8 },
  //   { line: "F", value: 19 }
  // ]
  // res.json(dataset);
  client.get('intersect-count', (err, reply) => {
    res.json(JSON.parse(reply));
  });
});

app.get('/time-range-count/', function(req, res) {
  // let dataset = [
  //   {"range":"2019-10-12 10:00:00", "value":0},
  //   {"range":"2019-10-12 11:00:00", "value":0},
  //   {"range":"2019-10-12 12:00:00", "value":0},
  //   {"range":"2019-10-12 13:00:00", "value":0},
  //   {"range":"2019-10-12 14:00:00", "value":170},
  //   {"range":"2019-10-12 15:00:00", "value":2572},
  //   {"range":"2019-10-12 16:00:00", "value":3997},
  //   {"range":"2019-10-12 17:00:00", "value":1297},
  //   {"range":"2019-10-12 18:00:00", "value":0}
  // ]
  // res.json(dataset);
  client.get('time-range-count', (err, reply) => {
    res.json(JSON.parse(reply));
  });
});

app.get('/time-range-intrusion-count/', function(req, res) {
  // let dataset = [{"id": "エリア1", "range": "2019-10-13 10:00:00","value": "130"},
  //   {"id": "エリア2", "range": "2019-10-13 10:00:00", "value": "121"},
  //   {"id": "エリア3", "range": "2019-10-13 10:00:00", "value": "125"},
  //   {"id": "エリア4", "range": "2019-10-13 10:00:00", "value": "130"},
  //   {"id": "エリア1", "range": "2019-10-13 11:00:00", "value": "121"},
  //   {"id": "エリア2", "range": "2019-10-13 11:00:00", "value": "125"},
  //   {"id": "エリア3", "range": "2019-10-13 11:00:00", "value": "121"},
  //   {"id": "エリア4", "range": "2019-10-13 11:00:00", "value": "125"}]
  // res.json(dataset);
  client.get('time-range-intrusion-count', (err, reply) => {
    res.json(JSON.parse(reply));
  });
});

app.get('/time-range-intersect-count/', function(req, res) {
  // let dataset = [{"id": "ライン1", "range": "2019-10-13 10:00:00","value": "130"},
  //   {"id": "ライン2", "range": "2019-10-13 10:00:00", "value": "121"},
  //   {"id": "ライン3", "range": "2019-10-13 10:00:00", "value": "125"},
  //   {"id": "ライン4", "range": "2019-10-13 10:00:00", "value": "130"},
  //   {"id": "ライン1", "range": "2019-10-13 11:00:00", "value": "121"},
  //   {"id": "ライン2", "range": "2019-10-13 11:00:00", "value": "125"},
  //   {"id": "ライン3", "range": "2019-10-13 11:00:00", "value": "121"},
  //   {"id": "ライン4", "range": "2019-10-13 11:00:00", "value": "125"}]
  // res.json(dataset);
  client.get('time-range-intersect-count', (err, reply) => {
    res.json(JSON.parse(reply));
  });
});

http.listen(HTTP_PORT_NO, function() {
  console.log("server listening. Port:" + HTTP_PORT_NO);
});
