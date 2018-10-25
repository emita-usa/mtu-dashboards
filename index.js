"use strict";

const config = require("./config.json");

const Koa = require("koa");
const hbs = require("koa-hbs");
const serve = require("koa-static");
const mount = require("koa-mount");
const http = require("http");
const https = require("https");
const fs = require("fs");
const enforceHttps = require("koa-sslify");

// for passport support
const session = require("koa-session");
const bodyParser = require("koa-bodyparser");
const passport = require("koa-passport");

const app = new Koa();

exports.app = app;
exports.passport = passport;

// the auth model for passport support
require("./models/auth");

// misc handlebars helpers
require("./helpers/handlebars");

// trust proxy
app.proxy = true;

app.use(enforceHttps({
    trustProtoHeader: true
}));

// Force HTTPS on all page
// app.use(enforceHttps());

// sessions
app.keys = [config.site.secret];
app.use(session(app));

// body parser
app.use(bodyParser());

// authentication
app.use(passport.initialize());
app.use(passport.session());

// statically serve assets
app.use(mount("/assets", serve("./assets")));

// load up the handlebars middlewear
app.use(hbs.middleware({
    viewPath: `${__dirname}/views`,
    layoutsPath: `${__dirname}/views/layouts`,
    partialsPath: `${__dirname}/views/partials`,
    defaultLayout: "main"
}));

// Error handling middleware
app.use(async(ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        await ctx.render("error", {
            message: err.message,
            error: {}
        });
    }
});

require("./routes");

// SSL options
const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/console.disastertech.us/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/console.disastertech.us/fullchain.pem")
};

// start the server
http.createServer(app.callback()).listen(80);
https.createServer(options, app.callback()).listen(443);
/*
console.log(`${config.site.name} is now listening on port ${config.site.port}`);
app.listen(config.site.port);
*/

process.on("SIGINT", function exit() {
    process.exit();
});
