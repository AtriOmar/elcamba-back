const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

module.exports = (passport) => {
  //  ======================== Passport Session Setup ============================
  // required for persistent login sessions passport needs ability to serialize and unserialize users out of session
  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // used to deserialize the user

  passport.deserializeUser(async (id, done) => {
    const user = (
      await User.findByPk(id, {
        attributes: {
          exclude: "password",
        },
      })
    ).toJSON();
    done(null, user);
  });

  passport.use(
    new LocalStrategy({ usernameField: "email", passwordField: "password", passReqToCallback: true }, async (req, username, password, done) => {
      if (req.user) {
        done(null, req.user);
        return;
      }

      try {
        const result = await User.findOne({
          where: {
            email: username,
          },
        });
        const user = await result?.toJSON();

        console.log("from local", user);

        if (!user) {
          done(null, false, "user not found");
          return;
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
          if (!user.active) {
            done(null, false, "suspended");
            return;
          }
          delete user.password;

          console.log(user);

          done(null, user);
          return;
        } else {
          done(null, false, "password incorrect");
          return;
        }
      } catch (err) {
        done(err);
        return;
      }
    })
  );

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.MY_SECRET, // Replace with your actual secret key
      },
      async (payload, done) => {
        console.log("-------------------- payload --------------------");
        console.log(payload);
        try {
          const user = (await User.findByPk(payload.sub)).toJSON();

          if (!user) {
            return done(null, false);
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "/login/google/callback",
        proxy: true,
      },
      async function (accessToken, refreshToken, profile, cb) {
        const defaultUser = {
          username: profile.displayName,
          email: profile.emails[0].value,
          password: process.env.DEFAULT_PASSWORD,
          accessId: 1,
          active: 1,
        };
        const result = await User.findOrCreate({
          where: {
            email: profile.emails[0].value,
          },
          defaults: defaultUser,
        });
        const user = result[0].toJSON();

        cb(null, user);
      }
    )
  );
};

// // console.log(`Pass port use local-strategy sign in attempt for: ${username}`)

// if (!req.user && (!username === "" || password.length >= 5)) {
//   // callback with username and password from client must match basic requirements before even being compared in DB

//   // console.log('attempting to get user from DB')

//   db.User.getUserByUsernameWithPassword(username, (err, user) => {
//     if (err) {
//       // console.log('Error occured getting user from DB to compare against Posted user INFO')

//       // if err return err

//       return done(err);
//     } else if (!user) {
//       // console.log(`No user found Returning from local-strategy login failed to login ${username}`)

//       return done(null, false);
//     } else {
//       // console.log(`In local Strategy & Found ${username} from database comparing password..`)

//       // if user found, compare password against db password and return true or false if it matches

//       // console.log(user)

//       bcrypt.compare(password, user.password, (err, result) => {
//         if (err) {
//           // console.log('error in bcrypt compare')

//           done(err);
//         } else if (result) {
//           // console.log(`Successful login for User: ${user.username} ID: ${user.userId} Type:${user.type} type-ID:${user.accessId} removing pw from userObj and attaching to future requests`)

//           delete user.password;
//           done(null, user);
//         } else {
//           // console.log('Passwords did not match. Failed log in')

//           done(null, false);
//         }
//       });
//     }
//   });
// } else if (req.user) {
//   // console.log('User attempted to log in while already logged in.')
//   done(null, req.user);
// } else {
//   // console.log('Login attempt did not meet username and password requirements.')
//   return done(null, false);
// }
