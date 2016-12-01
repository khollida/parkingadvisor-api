var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Tickets = require('../models/Ticket.js');
var moment = require('moment');
var async = require('async');


/* GET all tickets listing. */
router.get('/', function(req, res, next) {
  Tickets.find(function (err, parking) {
    if (err) return next(err);
    res.json(parking);
  });
});

/* GET /parking/:id
   Returns specific ticket by ID in mongo
*/
router.get('/citation/:id', function(req, res, next) {
  Tickets.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* GET /parking/location/:location
   Finds Tickets by location
*/
router.get('/location/:location', function (req, res, next) {
        Tickets.find({ location: req.params.location }, function (err, citations) {
            if (err) return next(err);
            if(!citations.length) {
              res.header("Access-Control-Allow-Origin", "*");
              res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
              res.status(404).send({ error: "location not found" });
            } else {
              res.header("Access-Control-Allow-Origin", "*");
              res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
              res.json(citations);
            }

        });
});

/* GET /parking/amount/:amount */
router.get('/amount/:amount', function (req, res, next) {
        Tickets.find({ amount: req.params.amount }, function (err, citations) {
            if (err) return next(err);
            res.json(citations);
        });
});

/* GET /parking/location/:location/total
   Gives total sum of fines per location */
router.get('/location/:location/total', function (req, res, next) {
        Tickets.aggregate({ $match: { location: req.params.location } }, { $group: { _id: req.params.location, totalAmount: { $sum:  "$amount" }, count: { $sum: 1 }, avgAmount: { $avg: "$amount" }, maxAmount: { $max:"$amount" } } },
        function (err, citations) {
            if (err) return next(err);
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.json(citations);
        });
});

router.get('/dates', function (req, res, next) {
        Tickets.distinct('violation_date', function (err, citations) {
            if (err) return next(err);
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.json(citations);
        });
});

router.get('/dates/:month/:day/:year', function (req, res, next) {
        var dateParam = req.params.month + '/' + req.params.day + '/' + req.params.year;
        console.log(dateParam);
        Tickets.aggregate({ $match: { violation_date: dateParam } }, { $group: { _id: dateParam, totalAmount: { $sum:  "$amount" }, count: { $sum: 1 } } },
        function (err, citations) {
            if (err) return next(err);
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.json(citations);
        });
});

router.get('/chart/daily/labels', function(req,res,next){
  Tickets.aggregate({ $group: { _id: "$violation_date", total: { $sum:  "$amount" }, count: { $sum: 1 } } }, { $sort : { _id : 1 } },
  function (err, citations) {
      if (err) return next(err);
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      var chartdata = [];
      var response = citations;
      response.forEach(function(entry){
        chartdata.push(moment(entry._id).format('MM/DD/YYYY'));
      });

      if(chartdata.length == response.length){
        res.json(chartdata);
      }
      else {
      }
  });

});

router.get('/chart/daily/data', function(req,res,next){
  Tickets.aggregate({ $group: { _id: "$violation_date", total: { $sum:  "$amount" }, count: { $sum: 1 } } }, { $sort : { _id : 1 } },
  function (err, citations) {
      if (err) return next(err);
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      var chartdata = [];
      var response = citations;
      response.forEach(function(entry){
        chartdata.push(entry.total);
      });

      if(chartdata.length == response.length){
        res.json(chartdata);
      }
      else {
      }
  });
});

router.get('/chart/monthly/data', function(req,res,next){
  Tickets.aggregate({ $group: { _id: { $month: "$violation_date"}, total: { $sum:  "$amount" }, count: { $sum: 1 } } }, { $sort: { _id:1 }},
  function (err, citations) {
      if (err) return next(err);
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      var chartdata = [];
      var response = citations;
      response.forEach(function(entry){
        chartdata.push(entry.total);
      });
      if(chartdata.length == response.length){
        res.json(chartdata);
      }
      else {
      }
  });
});

router.get('/chart/monthly/count', function(req,res,next){
  Tickets.aggregate({ $group: { _id: { $month: "$violation_date"}, count: { $sum: 1 } } }, { $sort: { _id:1 }},
  function (err, citations) {
      if (err) return next(err);
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      var chartdata = [];
      var response = citations;
      response.forEach(function(entry){
        chartdata.push(entry.count);
      });
      if(chartdata.length == response.length){
        res.json(chartdata);
      }
      else {
      }
  });
});

/* Correct Dates */
router.get('/correctdates', function(req, res, next) {
  Tickets.find(function (err, parking) {
    if (err) return next(err);
    var output = parking;
    for(var i=0;i<output.length;i++){
      var newDate = moment(output[i].violation_date).format();
      Tickets.update({ _id: output[i]._id }, { $set: { violation_date: newDate }}, function(err, resp){
        if (err) console.log(err);
        console.log("Updated Successfully");
      });
      console.log("New date is: " + newDate);
    }
  });
  // res.status(200).send({ message: "Dates corrected" });
});



// router.get('/location/:location/total', function (req, res, next) {
//         Tickets.aggregate({ $group: { _id: null, totalAmount: { $sum:  "$amount" } } },
//         function (err, citations) {
//             if (err) return next(err);
//             res.json(citations);
//         });
// });

module.exports = router;
