/* eslint-disable indent */
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

    // getWeatherAlerts("Atlanta", "ID");
    // getWeatherAlerts("Billings", "OK");
    // getWeatherAlerts("Joplin", "MO");

    const city = "O'Fallon";
    const state = "IL";
//    const city = "Colony";
//    const state = "KS";

    const location = `${ city }, ${ state }`;
    const weatherData = await getWeatherData(city, state);
    const weatherAlertData = await getWeatherAlerts(city, state);
    const conditionsData = await getWeatherConditions(city, state);
    const conditions = await processConditionsData(conditionsData);
    const alerts = await processAlertsData(weatherAlertData);
    const weather = await processWeatherData(weatherData);

    const disasterEventData = await getEvents("disasters", "1,2,3,4,5");
    const severeWeatherEventData = await getEvents("severe-weather", 5);
    const terrorEventData = await getEvents("terror", "1,2,3,4,5");

    const eventCollection = [disasterEventData, terrorEventData, severeWeatherEventData];
    const processedEvents = await processEventData(eventCollection);

    // const placeParameters = {"input": location, "inputtype": "textquery", "fields": "photos"};
    // const placeResponse = await googleMapsClient.findPlace(placeParameters).asPromise();
    // const photoResponse = await getPhotoFromPlaceResponse(placeResponse);
    // const photoData = await getPhotoDataFromPhotoResponse(photoResponse);

    console.log(alerts);

    await ctx.render("weather", {
        title: config.site.name,
        location: location,
        weather: weather,
        conditions: conditions,
        alerts: alerts,
        events: processedEvents,
        user: JSON.stringify(user, null, 2)
    });
};

function getWeatherAlerts(city, state) {
    return new Promise((resolve) => {
        const Wunderground = require("node-weatherunderground");
        const weatherClient = new Wunderground();
        const weatherOps = {"key": config.site.wunderground, "city": city, "state": state};
        weatherClient.alerts(weatherOps, function weatherResponseHandler(err, alerts) {
            console.log(alerts);
            resolve(alerts);
        });
    });
}

function getWeatherConditions(city, state) {
    return new Promise((resolve) => {
        const Wunderground = require("node-weatherunderground");
        const weatherClient = new Wunderground();
        const weatherOps = {"key": config.site.wunderground, "city": city, "state": state};
        weatherClient.conditions(weatherOps, function weatherResponseHandler(err, conditions) {
            resolve(conditions);
        });
    });
}

function getWeatherData(city, state) {
    return new Promise((resolve) => {
        const Wunderground = require("node-weatherunderground");
        const weatherClient = new Wunderground();
        const weatherOps = {"key": config.site.wunderground, "city": city, "state": state};
        weatherClient.hourly(weatherOps, function weatherResponseHandler(err, hourly) {
            resolve(hourly);
        });
    });
}

function processEventData(eventSets) {
    return new Promise((resolve) => {
        const _ = require("lodash");
        const finalEvents = [];
        _.forEach(eventSets, function handleEventSet(eventSet) {
            _.forEach(eventSet.result.results, function handleEvent(rawEvent) {
                const event = _.pick(rawEvent, ["rank", "title", "location", "scope", "state", "description", "start", "end", "updated", "first_seen", "duration"]);
                if (event.rank >= 90) {
                    switch (event.scope) {
                        case "locality":
                            event.severity = "warning";
                            break;
                        case "county":
                            event.severity = "danger";
                            break;
                        case "region":
                            event.severity = "danger";
                            break;
                        case "country":
                            event.severity = "danger";
                            break;
                    }
                } else if (event.rank >= 85) {
                    switch (event.scope) {
                        case "locality":
                            event.severity = "default";
                            break;
                        case "county":
                            event.severity = "warning";
                            break;
                        case "region":
                            event.severity = "warning";
                            break;
                        case "country":
                            event.severity = "danger";
                            break;
                    }
                } else {
                    switch (event.scope) {
                        case "locality":
                            event.severity = "default";
                            break;
                        case "county":
                            event.severity = "default";
                            break;
                        case "region":
                            event.severity = "warning";
                            break;
                        case "country":
                            event.severity = "danger";
                            break;
                    }
                }
                event.labels = [];
                _.forEach(rawEvent.labels, function handleLabel(label) {
                   const updatedLabel = {"label": label, "severity": event.severity };
                   event.labels.push(updatedLabel);
                });
                finalEvents.push(event);
            });
        });
        resolve(finalEvents);
    });
}

function getEvents(category, rank) {
    const fetch = require("node-fetch");
    const phq = require("predicthq");
    const moment = require("moment");
    const client = new phq.Client({access_token: config.site.predicthq, fetch: fetch});
    return client.events.search({category: category, rank_level: rank, state: "active", country: "US", "start.gte": moment().subtract(5, "days").format("YYYY-MM-DD")});
}

function processAlertsData(data) {
    return new Promise((resolve) => {
        const _ = require("lodash");
        const processedAlertData = [];
        _.forEach(data, function handleWeatherAlert(alert) {
            const processedAlert = {};
            switch (alert.significance) {
                case "W":
                    processedAlert.severity = "danger";
                    break;
                case "A":
                    processedAlert.severity = "warning";
                    break;
                default:
                    processedAlert.severity = "info";
            }
            processedAlert.type = alert.type;
            processedAlert.description = alert.description;
            processedAlert.message = alert.message;
            processedAlert.expires = alert.expires;
            processedAlertData.push(processedAlert);
        });
        resolve(processedAlertData);
    });
}

function processWeatherData(data) {
    return new Promise((resolve) => {
        const _ = require("lodash");
        const processedWeatherData = [];
        _.forEach(_.slice(data, 1, 7), function handleWeatherArray(segment) {
            const temp = segment.temp.english;
            const time = segment.FCTTIME.civil;
            const wx = segment.wx;
            const icon = segment.icon;
            const icon_url = segment.icon_url;
            const feelslike = segment.feelslike.english;
            const wspd = segment.wspd.english;
            const wdir = segment.wdir.dir;
            processedWeatherData.push({
                temp: temp,
                time: time,
                wx: wx,
                icon: icon,
                icon_url: icon_url,
                feelslike: feelslike,
                wspd: wspd,
                wdir: wdir
            });
        });
        resolve(processedWeatherData);
    });
}

function processConditionsData(data) {
    return new Promise((resolve) => {
        const _ = require("lodash");
        const processedConditionData = _.pick(data, ["weather", "temp_f", "relative_humidity", "wind_dir", "wind_mph", "wind_gust_mph", "feelslike_f", "visibility_mi", "precip_1hr_in", "icon"]);
        resolve(processedConditionData);
    });
}

function getPhotoFromPlaceResponse(placeResponse) {
    const photoReference = placeResponse.json.candidates[0].photos[0].photo_reference;
    const photoParameters = {
        "photoreference": photoReference,
        "maxwidth": 1600,
        "maxheight": 450
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