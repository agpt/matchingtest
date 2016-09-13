var csv = require('fast-csv');

var PubSub = require('./pubsub');
var fs = require('fs');
var Levenshtein = require('levenshtein');

var fpaData = require('../data/fpa.json');
var tpaData = require('../data/tpa.json');

module.exports.consumeData = function (data) {
  console.log('in service', data.type);
  console.log(data);
};

module.exports.createJSON = function () {
  console.log(__dirname);

  var stream = fs.createReadStream(__dirname + '/RDFM_TRG_US_FPA_CONV_TPA_SIZM_SUBZERO_201603.csv');

  var fpas = [];
  var tpas = [];
  var keys = {
    placement_name: null,
    impressions: null,
    clicks: null,
    event_datetime: null,
  };

  var csvStream = csv.parse()
    .on('data', function (data) {
      console.log(data);
      var fpa = Object.assign({}, keys);
      var tpa = Object.assign({}, keys);

      fpa.placement_name = data[0];
      fpa.impressions = data[2];
      fpa.clicks = data[4];
      fpa.event_datetime = data[6];

      tpa.placement_name = data[1];
      tpa.impressions = data[3];
      tpa.clicks = data[5];
      tpa.event_datetime = data[7];

      fpas.push(fpa);
      tpas.push(tpa);
    })
    .on('end', function () {
      console.log('done');
      fs.writeFile('./fpa.json', JSON.stringify(fpas), 'utf-8');
      fs.writeFile('./tpa.json', JSON.stringify(tpas), 'utf-8');
    });

  stream.pipe(csvStream);
};

var filterlist = (source, minDistance) =>
  (target) => {
    var l = new Levenshtein(source.placement_name, target.placement_name);
    var isMatched = false;
    if (l.distance < minDistance) {
      var sourcePlacementName = source.placement_name.match(/(\d+x\d+)/);
      var targetPlacementName = target.placement_name.match(/(\d+x\d+)/);

      if (sourcePlacementName && targetPlacementName) {
        isMatched = (sourcePlacementName[0] === targetPlacementName[0]);
      } else if (sourcePlacementName === targetPlacementName) {
        // i.e. if both are null or undefined

        isMatched = true;
      }

      if (isMatched) {
        minDistance = l.distance;
      }
    }

    return isMatched;
  };

var match = (sourceData, targetData) =>
  sourceData.map((source) => {
    //var _item = Object.assign({}, item);
    var list = targetData.filter((target) => target.event_datetime === source.event_datetime);
    var minDistance = 100000;
    var target = list.filter(filterlist(source, minDistance));
    return {
      source: source,
      target: target,
    };
  });

module.exports.initMatch = function () {
  var fpaMatch = match(fpaData, tpaData);
  var tpaMatch = match(tpaData, fpaData);

  console.log(fpaMatch, tpaMatch);
};

// (function fpaScheduler() {
//   setTimeout(function () {
//     var data = dummyjson.parse(template);
//     PubSub.nrp.emit('fpaQueue', data);
//     fpaScheduler();
//   }, 2000);
// })();
//
// (function tpaScheduler() {
//   setTimeout(function () {
//     var data = dummyjson.parse(template);
//     PubSub.nrp.emit('tpaQueue', data);
//     tpaScheduler();
//   }, 1000);
// })();
