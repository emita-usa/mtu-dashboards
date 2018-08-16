"use strict";

const hbs = require("koa-hbs");
const config = require("../config.json");



hbs.registerHelper("if_eq", function if_eq(a, b, opts) {
    if (a === b) {
        return opts.fn(this);
    }
    return opts.inverse(this);
});

hbs.registerHelper("copyright_year", (opts) => {
    return new Date().getFullYear();
});

hbs.registerHelper("get_name", (opts) => {
    return config.site.name;
});

hbs.registerHelper("get_analytics", (opts) => {
    if (config.site.analytics) {
        return config.site.analytics;
    }
});

hbs.registerHelper("get_places", (opts) => {
    if (config.site.places) {
        return config.site.places;
    }
});

hbs.registerHelper("get_wunderground", (opts) => {
    if (config.site.wunderground) {
        return config.site.wunderground;
    }
});

hbs.registerHelper("get_rader_url", (opts) => {
    if (config.site.wunderground) {
        return  `http://api.wunderground.com/api/${ config.site.wunderground }/animatedradar/q/IL/O'FALLON.gif?newmaps=1&timelabel=1&timelabel.y=10&num=5&delay=50`;
    }   
});

hbs.registerHelper("has_analytics", function has_analytics(opts) {
    const fnTrue = opts.fn;
    const fnFalse = opts.inverse;
    return (config.site.analytics && config.site.analytics !== false) ? fnTrue() : fnFalse();
});


