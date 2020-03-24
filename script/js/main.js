/**
Application : dashboard
Debugescription : ダッシュボードの描画呼び出しをするメインのJavascriptです。
Version : 1.0.0
Dependencies : node.js + Express + iosocket.js + DB + jQuery + d3.js
Auther : Magosa
**/

let socketio = io();

$(function main() {

  let margin = {
    "top": 30,
    "bottom": 40,
    "right": 30,
    "left": 50
  };

  //インスタンスの生成
  let flow = new Trajectory('trajectory-svg', '#trajectory-view > .card-body');
  let heatmap = new Trajectory('heat-map-svg', '#heat-map > .card-body');
  let pred_heatmap = new Trajectory('heat-map-predict-svg', '#heat-map-predict > .card-body');
  let current_text = new Text('real-count-svg', '#real-count > .card-body');
  let total_text = new Text('total-count-svg', '#total-count > .card-body');
  let intersect = new Graph('hour-count-svg', '#hour-count > .card-body');
  let areacount = new Graph('area-ratio-svg', '#area-ratio > .card-body');

  //色の設定
  const LINE_COLORS = d3.scaleOrdinal()
  .range(["#DC3912", "#ffc200", "#5be400", "#008f09", "#00ffd4", "#0016ff", "#a034ff", "#fe20d7"]);
  const AREA_COLORS = d3.scaleOrdinal()
  .range(["#DC3912", "#ffc200", "#5be400", "#008f09", "#00ffd4", "#0016ff", "#a034ff", "#fe20d7"]);

  intersect.setColor = LINE_COLORS;
  areacount.setColor = AREA_COLORS;
  current_text.setColor = d3.scaleLinear()
  .domain([0, 25, 50, 75, 100, 125])
  .range(["#2200ff", "#18d6fe", "#109618", "#FF9900", "#DC3912", "#990099"]);
  total_text.setColor = d3.scaleLinear()
  .domain([0, 5000, 10000, 15000, 20000, 25000])
  .range(["#2200ff", "#18d6fe", "#109618", "#FF9900", "#DC3912", "#990099"]);

  //初期化処理
  InitTooltip();

  d3.json("/data/config.json").then(data => {
    flow.initMap(data);
    flow.setLine = LINE_COLORS;
    flow.setArea = AREA_COLORS;
    heatmap.initMap(data);
    pred_heatmap.initMap(data);
    intersect.initBarchart(data, margin);
    areacount.initPiechart(3);
  });


  //予測描画処理
  // d3.json("/data/prediction/pred_heatmap.json").then(data => {
  //   pred_heatmap.drawHeatmap(data);
  // });
  // d3.json("/data/prediction/pred_areacount.json").then(data => {
  //   areacount.drawPieChart(data);
  // });
  // d3.json("/data/prediction/pred_linecount.json").then(data => {
  //   intersect.drawIntersectcount(data);
  // });

  //描画処理
  socketio.on('sensor_data', data => {
    flow.drawFlow(data);
    current_text.drawText(data.length);
  });
  d3.json('http://localhost:8000/all-count/').then(data => {
    total_text.drawText(data);
  });
  d3.json('http://localhost:8000/heatmap/').then(data => {
    heatmap.drawHeatmap(data);
  });


  // d3.json('http://localhost:8080/time-range-count/').then(function(data) {
  //   intersect.drawHourlycount(data);
  // });

  d3.json('http://localhost:8000/time-range-intersect-count/').then(data => {
    intersect.drawIntersectcount(data);
  });

  d3.json('http://localhost:8000/intrusion-count/').then(data => {
    areacount.drawPieChart(data);
  });

  setInterval(() => {
    d3.json('http://localhost:8000/heatmap/').then(data => {
      heatmap.drawHeatmap(data);
    });
    d3.json('http://localhost:8000/all-count/').then(data => {
      total_text.drawText(data);
    });
  }, 5000);

  setInterval(() => {
    // d3.json('http://localhost:8080/time-range-count/').then(function(data) {
    //   DrawHourCount('#hour-count-svg', data, margin);
    // });
    d3.json('http://localhost:8000/time-range-intersect-count/').then(data => {
      intersect.drawIntersectcount(data);
    });
    d3.json('http://localhost:8000/intrusion-count/').then(data => {
      areacount.drawPieChart(data);
    });
  }, 60000);

  setInterval(() => {
    d3.json("/data/prediction/pred_heatmap.json").then(data => {
      pred_heatmap.drawHeatmap(data);
    });
    d3.json("/data/prediction/pred_areacount.json").then(data => {
      areacount.drawPieChart(data);
    });
  }, 600000);
});
