const Distances = require("./distances");

class IncidenceService {
    constructor(conn) {
        this.db = conn;
    }

    getIncidenceAndBearing(lat, lng, datetime, callback) {
        // this.getNearbyPoints(lat, lng);
        this.db.query(`select * from orbits where utc between DATE_SUB('${datetime}', INTERVAL 1 MINUTE) and '${datetime}' `, (err, res) => {
            let pointy;
            for (const row of res) {
                console.log(row);
                if (Distances.getDistance(lat, lng, row.lat, row.lng) < 1000) {
                    pointy = {lat: row.lat, lng: row.lng, bearing: row.direction};
                    break;
                }
            }

            if (!pointy) {
                return void callback("no match");
            }
            return void callback(Distances.getNearestPoint(
                pointy.lat, pointy.lng, pointy.bearing, lat, lng
            ));
        });
    }

    getOverflights(lat, lng, callback) {
        this.getNearbyPoints(lat, lng, points => {
            const validPoints = points.filter(pt => {
                if (pt.orbit_type === 'A' && lng > pt.lng) return true;
                if (pt.orbit_type === 'D' && lng < pt.lng) return true;
                return false;
            });
            const pointsByGroup = {};
            for (const pt of validPoints) {
                const grp = pt.mission + pt.absolute_orbit + pt.orbit_type;
                if (!pointsByGroup[grp]) {
                    pointsByGroup[grp] = pt;
                }
                else if (pointsByGroup[grp].id > pt.id) {
                    pointsByGroup[grp] = pt;
                }
            }

            const answer = [];
            for (const pt of Object.values(pointsByGroup)) {
                const info = Distances.getNearestPoint(
                    pt.lat, pt.lng, pt.direction, lat, lng
                );
                info.id = pt.id;
                info.utc = pt.utc;
                info.mission = pt.mission;
                info.satelliteBearing = pt.direction;
                info.orbitType = pt.orbit_type;
                answer.push(info);
            }

            return void callback(answer);
        });
    }

    getNearbyPoints(lat, lng, callback) {
        const minDistance = 400;
        const maxDistance = 850;
        const query = `
        select *, 
        (
        sqrt(
 (
    ((radians(lng)-radians(${lng})) * cos((radians(${lat})+radians(lat))/2)) * ((radians(lng)-radians(${lng})) * cos((radians(${lat})+radians(lat))/2)) 
 )
 +  
  (
      (radians(lat)-radians(${lat})) * (radians(lat)-radians(${lat}))
  )
 ) 
 * 6378
        ) as distanceToObj
        from orbits
        having distanceToObj between 400 and 850
        `;

        this.db.query(query, (err, rslt) => {
            if (err) {
                throw err;
            }
            return void callback(rslt);
        });

        return query;
    }
}

exports.default = IncidenceService;