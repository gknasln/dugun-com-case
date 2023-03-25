import axios from "axios";

export function applyPolyfils() {
  window.google.maps.LatLng.prototype.kmTo = function(a){
    var e = Math, ra = e.PI/180;
    var b = this.lat() * ra, c = a.lat() * ra, d = b - c;
    var g = this.lng() * ra - a.lng() * ra;
    var f = 2 * e.asin(e.sqrt(e.pow(e.sin(d/2), 2) + e.cos(b) * e.cos
    (c) * e.pow(e.sin(g/2), 2)));
    return f * 6378.137;
  }
  
  window.google.maps.Polyline.prototype.getKmDifference = function(n){
    var a = this.getPath(n), len = a.getLength(), dist = 0;
    for(var i=0; i<len-1; i++){
      dist += a.getAt(i).kmTo(a.getAt(i+1));
    }
    return dist;
  }
}

//This method returns direction in degree
export function getDirection(lat1, long1, lat2, long2) {
  const delta_latitude = lat2 - lat1; // -1.0748;
  const delta_longitude = long2 - long1; // 3.8813

  const direction = Math.atan2(delta_longitude, delta_latitude);
  return parseInt(direction * 180 / Math.PI); //degree output
}

/*
* I had limited knowledge about boats. I have research this on internet.
* For detailed calculation, there should be more information. I found this on internet
*/
export function calculateWindResistance(windDirection, windSpeed, boatDirection, boatSpeed) {
  let speed = Math.round(boatSpeed - windSpeed * Math.cos(windDirection - boatDirection));
  return speed;
}

let recursiveRequestCount = 1;
export function getWindData(coord) {
  return new Promise((resolve, reject) => {
    axios.get(`https://weather-api.dugun.work?latitude=${coord.lat}&longitude=${coord.lng}`)
    .then(res => {
      recursiveRequestCount = 1;
      resolve(res.data);
    })
    .catch(err => {
      console.error("win data request failed", recursiveRequestCount);
      if(recursiveRequestCount > 3 ){
        reject(err);
      }else{
        recursiveRequestCount++;
        resolve(getWindData(coord));
      }
    })
  });
}
