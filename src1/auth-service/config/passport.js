const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
//const User = require("../models/User");
const sendMail = require("../services/sendMail");
const mongoose = require("mongoose");

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
				let user = await User.findOne({
					$or: [{ email: profile.emails[0].value }, { googleId: profile.id }],
				});
				if (!user) {
					const session = await mongoose.startSession();
					try {
						session.startTransaction();
						user = await User.create(
							[
								{
									googleId: profile.id,
									username: profile.displayName,
									email: profile.emails[0].value,
								},
							],
							{ session: session },
						);
						user = user[0];
						await sendMail("welcome", {
							email: user.email,
							username: user.username,
						});

						await session.commitTransaction();
						session.endSession();
					} catch (err) {
						await session.abortTransaction();
						session.endSession();
						console.log("Transaction failed:", err);
						return res.status(500).json({ message: "Something went wrong" });
					}
				} else {
					if (user.googleId !== profile.id) {
						user.googleId = profile.id;
						await user.save();
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
