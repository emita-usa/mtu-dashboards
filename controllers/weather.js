"use strict";

const config = require("../config.json");
const googleMapsClient = require("@google/maps").createClient({
    key: config.site.places,
    Promise: Promise
});

module.exports.index = async(ctx) => {
    let user;
    if (ctx.isAuthenticated()) {
        user = ctx.session.passport.user;
    } else {
        return ctx.redirect("/");
    }

    const Wunderground = require("wunderground-api");
    const weatherClient = new Wunderground(config.site.wunderground, "O'Fallon", "IL");
    const hourly = weatherClient.hourly();
    const location = "O'Fallon, IL";
    const placeParameters = {"input": location, "inputtype": "textquery", "fields": "photos"};
    const placeResponse = await googleMapsClient.findPlace(placeParameters).asPromise();
    const photoResponse = await getPhotoFromPlaceResponse(placeResponse);
    const photoData = await getPhotoDataFromPhotoResponse(photoResponse);

    await ctx.render("weather", {
        title: config.site.name,
        photoData: photoData,
        location: location,
        user: JSON.stringify(user, null, 2)
    });
};

function getPhotoFromPlaceResponse(placeResponse) {
    const photoReference = placeResponse.json.candidates[0].photos[0].photo_reference;
    const photoParameters = {
        "photoreference": photoReference,
        "maxwidth": 1600
    };
    return googleMapsClient.placesPhoto(photoParameters).asPromise();
}

function getPhotoDataFromPhotoResponse(photoResponse) {
    return new Promise((resolve) => {
        let body = "";
        const contentDisposition = require("content-disposition");
        const fs = require("fs");
        const type = photoResponse.headers["content-type"];
        const dispositionHeader = photoResponse.headers["content-disposition"];
        const disposition = contentDisposition.parse(dispositionHeader);
        const filename = disposition.parameters["filename"];
        console.log(disposition);
        const prefix = `data:${  type  };base64,`;
        const stream = fs.createWriteStream(`assets/img/cache/${ filename }`);

        stream.once("open", function openFd(fd) {
            photoResponse.on("data", function acceptChunk(chunk) {
                // console.log("added chunk");
                body += chunk;
                stream.write(chunk);
            });

            photoResponse.on("end", function returnBody() {
                stream.end();
                const base64 = Buffer.from(body).toString("base64");
                // console.log(`returning: ${ prefix }${ base64 }`);
                resolve(`assets/img/cache/${ filename }`);
            });
        });
    });
}