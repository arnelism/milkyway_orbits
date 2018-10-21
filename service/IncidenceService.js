const Distances = require("./distances");

class IncidenceService {
    constructor(conn) {
        this.db = conn;
    }

    getIncidenceAndBearing(lat, lng, datetime, callback) {
        this.db.query(`select * from orbits where utc between DATE_SUB('${datetime}', INTERVAL 1 MINUTE) and '${datetime}' `, (err, res) => {
            let pointy;
            for (const row of res) {
                console.log(row);
                if (Distances.getDistance(lat, lng, row.lat, row.lng) < 1000) {
                    pointy = {lat: row.lat, lng: row.lng, bearing: row.direction};
                    break;
                }
            }
            console.log(pointy);
            // const lat1 = 59.17029;
            // const lng1 = 23.96118;
            // const lat2 = 58.13012;
            // const lng2 = 22.95044;
            // const latX = 58.68836;
            // const lngX = 22.90649;

            if (!pointy) {
                return void callback("no match");
            }
            return void callback(Distances.getNearestPoint(
                pointy.lat, pointy.lng, pointy.bearing, lat, lng
            ));
        });
    }
}

exports.default = IncidenceService;