var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Geolocations = require('../models/Geolocation.js');

/* GET all geolocations  */
router.get('/', function(req, res, next) {
  Geolocations.find(function (err, geolocation) {
    if (err) return next(err);
    res.json(geolocation);
  });
});

/* GET /parking/location/:location
   Finds Tickets by location
*/
router.get('/:space', function (req, res, next) {
        Geolocations.find({ space: req.params.space }, function (err, positions) {
            if (err) return next(err);
            if (!positions.length){
              res.header("Access-Control-Allow-Origin", "*");
              res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
              res.status(200).send([{ longitude:0, latitude:0 }]);
            } else {
              res.header("Access-Control-Allow-Origin", "*");
              res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
              res.json(positions);
            }
        });
});

module.exports = router;
