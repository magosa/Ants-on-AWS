/**
Application : ants-demo
Description : 人流クラウド化の導通試験用プログラム
Version : 1.0.0
Dependencies : node.js + Express + Socket.io
Auther : Magosa
**/

const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const http = require('http').Server(app);
const fs = require('fs');
const io = require('socket.io')(http);
const PORT = process.env.PORT || 8080;

const {Client} = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Ants',
  password: 'postgres',
  port: 5432,
})
client.connect()


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

io.on('connection', socket => {
  socket.on('current_data', msg => {
    let data = JSON.parse(msg);
    io.emit('routing_data', data);

    const sql_head = "INSERT INTO raw_data (";
    let keys = "";
    let sql_value = "";
    data.forEach(function(dataset) {
      let values = ""
      keys = Object.keys(dataset);
      keys.forEach(function(key) {
        if (key == "grid_id" || "area_id") {
          values = values + "'" + dataset[key] + "', ";
        } else {
          values = values + dataset[key] + ", ";
        }
      });
      sql_value = sql_value + "(" + values.substring(0, values.length - 2) + "), ";
    });
    let sql = sql_head + keys.join(",") + ") VALUES " + sql_value.substring(0, sql_value.length - 2) + ";";
    client.query(sql, (err, res) => {
      if (err) {
        console.log(err);
      };
    });
  });
});

http.listen(PORT, () => {
  console.log("server listening. Port:" + PORT);
});

client.query('SELECT NOW()', (err, res) => {
  console.log(err, res);
});
