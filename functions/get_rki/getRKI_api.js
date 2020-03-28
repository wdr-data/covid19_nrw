var RKIurl = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=OBJECTID&resultOffset=0&resultRecordCount=1000&cacheHint=true'
const request = require("request");
const util = require('util');

let getRKI = function getCorona() {
    return new Promise(function(resolve, reject) {
        request(RKIurl, (err, res, body) => {
            //let Output = body.split(",");
            const obj = JSON.parse(body)
            resolve(obj);
        })
    })
}

getRKI().then(function(RKI) {
    //console.log(RKI.features)
    RKI.features.map((Werte) => {
        let Grammatik = ['sind','sind'];
        if(Werte.attributes.cases === 1){Grammatik[0] = "ist";}
        if(Werte.attributes.deaths === 1){Grammatik[1] = "ist";}
        console.log("In " + Werte.attributes.BL + " (" + Werte.attributes.county + ") " + Grammatik[0] + " " + Werte.attributes.cases + " infiziert, dass sind " + Werte.attributes.cases_per_100k + " pro 100.000 Einwohner.\nDort " + Grammatik[1] + " " + Werte.attributes.deaths + " gestorben, dass macht eine Todesrate von " + Math.round(Werte.attributes.death_rate * 100) / 100 + "%\n\n")
    });
});

module.exports = {
	getRKI
};
