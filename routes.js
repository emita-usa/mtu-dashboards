/* eslint-disable func-names */
"use strict";

const config = require("./config.json");

const app = require("./index.js").app;
const passport = require("./index.js").passport;
const Router = require("koa-router");

const router = new Router();

const main = require("./controllers/main.js");
const account = require("./controllers/account.js");
const weather = require("./controllers/weather.js");

// routes

router.get("/", main.index);

// for passport
router.get("/login", account.login);
router.get("/logout", account.logout);
router.get("/account", account.index);
router.get("/weather/:state/:city", weather.index);

// you can add as many strategies as you want
router.get("/auth/github",
    passport.authenticate("github", {
        successRedirect: "/account",
        failureRedirect: "/login"
    })
);

router.get("/auth/github/callback",
    passport.authenticate("github", {
        successRedirect: "/account",
        failureRedirect: "/login"
    }, function(req, res) {
        res.redirect("/");
    })
);

router.get("/auth/microsoft",
    passport.authenticate("azuread-openidconnect",{
        successRedirect: "/account",
        failureRedirect: "/login"
    }, function(req, res) {
        log.info("Login was called in the Sample");
        res.redirect("/");
    })
);

router.get("/auth/microsoft/callback",
    passport.authenticate("azuread-openidconnect", {
        successRedirect: "/account",
        failureRedirect: "/login"
    })
);

// Middleware: authed
function* authed(next) {
    if (this.req.isAuthenticated()) {
        yield next;
    } else {
        this.redirect("/auth/microsoft");
    }
}
/*
router.get("/auth/microsoft/callback", async(ctx) => {
    return passport.authenticate("azuread-openidconnect", (err, user, info, status) => {
        if (err) console.log({ "err": err });
        if (info) console.log({ "info": info });
        if (status) console.log({ "status": status });
        if (user) console.log({ "user": user });
        //if (user) {
        ctx.redirect("/account");
        //} else {
        //    ctx.status = 400;
        //    ctx.body = { status: "error, no user" };
        //}
    })(ctx);
});
*/
app.use(router.routes());
app.use(router.allowedMethods());
