var mongoose = require('mongoose');
var GeoSchema = new mongoose.Schema({
  space: Number,
  latitude: Number,
  longitude: Number
});
module.exports = mongoose.model('Geolocation', GeoSchema);
