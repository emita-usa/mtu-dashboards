"use strict";

const passport = require("../index.js").passport;
const config = require("../config.json");
const users = {};

passport.serializeUser((user, done) => {
    done(null, user.oid);
});

passport.deserializeUser((id, done) => {
    // eslint-disable-next-line func-names
    const _ = require("underscore");
    if (_.has(users, id)) {
        done(null, users[id]);
    } else {
        done(null, null);
    }
});

// if we have a port other than 80, add it to our callback url
let port = "";
if (config.site.port !== 80) {
    port = `:${config.site.port}`;
}

function getUserData(accessToken) {

    const MicrosoftGraph = require("@microsoft/microsoft-graph-client");

    const client = MicrosoftGraph.Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        }
    });

    return client
        .api("/me")
        .get();
}

const GithubStrategy = require("passport-github").Strategy;
passport.use(new GithubStrategy({
    clientID: config.site.oauth.github.clientID,
    clientSecret: config.site.oauth.github.clientSecret,
    callbackURL: `${config.site.oauth.host}${port}/auth/github/callback`
}, (token, tokenSecret, profile, done) => {
    // retrieve user ...
    done(null, profile);
}));

const OIDCStrategy = require("passport-azure-ad").OIDCStrategy;

const callback = (iss, sub, profile, accessToken, refreshToken, done) => {
    if (!profile.oid) {
        return done(new Error("No oid found"), null);
    }

    // eslint-disable-next-line func-names
    const _ = require("underscore");
    if (_.has(users, profile.oid)) {
        done(null, users[profile.oid]);
    }

    getUserData(accessToken)
        .then((userInfo) => {
            console.log("Retrieved User Data");
            console.log(userInfo);
            profile.name = { "familyName": userInfo.surname, "givenName": userInfo.givenName };
            profile.emails = userInfo.mail;
            profile.mobilePhone = userInfo.mobilePhone;
            profile.officeLocation = userInfo.officeLocation;
            profile.preferredLanguage = userInfo.preferredLanguage;
            profile.businessPhones = userInfo.businessPhones;
            profile.jobTitle = userInfo.jobTitle;
            users[profile.oid] = {profile, accessToken, refreshToken};
            return done(null, profile);
        }).catch((err) => {
            console.log(err);
            return err;
        });
};

const openIDCreds = {
    redirectUrl: `${config.site.oauth.host}${port}/auth/microsoft/callback`,
    clientID: config.site.oauth.microsoft.applicationID,
    clientSecret: config.site.oauth.microsoft.applicationSecret,
    identityMetadata: "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
    skipUserProfile: true,
    responseType: "code",
    validateIssuer: false,
    responseMode: "query",
    scope: ["User.Read", "Mail.Send", "profile"],
    allowHttpForRedirectUrl: true
};

passport.use(new OIDCStrategy(openIDCreds, callback));
