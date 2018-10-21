module.exports = class Distances {

    static getNearestPoint(satLat, satLng, satBearing, objLat, objLng) {
        let minDistance = Number.MAX_SAFE_INTEGER;
        let lastLatLng = null;
        const sl = this.applyBearingAndDistance(satLat, satLng, satBearing, -1000);
        for (let distance=0; distance<2000; distance+=10) {
            const latLng = this.applyBearingAndDistance(sl.lat, sl.lng, satBearing, distance);
            const distanceFromObj = this.getDistance(objLat, objLng, latLng.lat, latLng.lng);
            if (lastLatLng != null && distanceFromObj > minDistance ) {
                break;
            }
            minDistance = distanceFromObj;
            lastLatLng = latLng;
        }
        return {
            distance: minDistance,
            satelliteLatLng: lastLatLng,
            bearingTowardsSattellite: this.getBearing(objLat, objLng,lastLatLng.lat, lastLatLng.lng)
        };
    }

    static getDistance(lat1, lng1, lat2, lng2) {
        const R = 6378.1;
        const φ1 = toRad(lat1);
        const λ1 = toRad(lng1);

        const φ2 = toRad(lat2);
        const λ2 = toRad(lng2);

        const x = (λ2-λ1) * Math.cos((φ1+φ2)/2);
        const y = (φ2-φ1);
        return Math.sqrt(x*x + y*y) * R;
    }

    static getBearing(lat1, lng1, lat2, lng2) {
        const φ1= toRad(lat1);
        const λ1= toRad(lng1);
        const φ2= toRad(lat2);
        const λ2= toRad(lng2);
        const y = Math.sin(λ2-λ1) * Math.cos(φ2);
        const x = Math.cos(φ1)*Math.sin(φ2) -
            Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
        return toDegrees(Math.atan2(y, x));
    }

    static applyBearingAndDistance(lat, lng, bearing, distance) {
        const EARTH_RADIUS = 6378.1;
        const brngRad = toRad(bearing);
        const lat1Rad = toRad(lat);
        const lng1Rad = toRad(lng);


        const latBRad = Math.asin(
            Math.sin(lat1Rad) * Math.cos(distance/EARTH_RADIUS) +
            Math.cos(lat1Rad) * Math.sin(distance/EARTH_RADIUS) * Math.cos(brngRad)
        );
        const lngBRad = lng1Rad + Math.atan2(
            Math.sin(brngRad) * Math.sin(distance/EARTH_RADIUS) * Math.cos(lat1Rad),
            Math.cos(distance/EARTH_RADIUS) - Math.sin(lat1Rad) * Math.sin(latBRad)
        );

        return {
            lat: toDegrees(latBRad),
            lng: toDegrees(lngBRad)
        };
    }
};

function toRad(degree) {
    return degree * Math.PI / 180;
}

function toDegrees(rad) {
    return rad * (180 / Math.PI);
}
