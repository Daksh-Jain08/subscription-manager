const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
//const User = require("../models/User");
const {sendMail} = require("../services/sendMail");
const mongoose = require("mongoose");
const prisma = require("../prisma");

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	const user = await User.findById(id);
	done(null, user);
});

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				let user = await prisma.user.findFirst({
					where: {
						OR: [{ email: profile.emails[0].value }, { googleId: profile.id }],
					},
				});
				if (!user) {
					try {
						user = await prisma.user.create({
							data: {
								googleId: profile.id,
								username: profile.displayName,
								email: profile.emails[0].value,
							},
						});
						await sendMail("welcome", {
							email: user.email,
							username: user.username,
						});
					} catch (err) {
						console.log("Transaction failed:", err);
						done(err, null);
					}
				} else {
					if (user.googleId !== profile.id) {
						user = await prisma.user.update({
							where: { email: user.email },
							data: { googleId: profile.id },
						});
					}
				}
				done(null, user);
			} catch (err) {

				console.log(`Error creating user in google login: ${err}`);
				done(err, null);
			}
		},
	),
);
