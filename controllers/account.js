"use strict";

const config = require("../config.json");

module.exports.login = async(ctx) => {
    let user;
    if (ctx.isAuthenticated()) {
        user = ctx.session.passport.user;
    }
    console.log(user);
    await ctx.render("login", {
        user: user
    });
};

module.exports.logout = async(ctx) => {
    ctx.logout();
    console.log("redirecting");
    await ctx.redirect("/");
};

module.exports.index = async(ctx) => {
    let user;
    if (ctx.isAuthenticated()) {
        let userID = ctx.session.passport.user;
        user =
        console.log({"authenticated_user": user});
    } else {
        console.log("redirecting");
        return ctx.redirect("/");
    }
    await ctx.render("account", {
        title: config.site.name,
        user: JSON.stringify(user, null, 2)
    });
};