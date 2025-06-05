import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../db/models/user";
// import { connectToDB } from "../db/mongo";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate token function
export function generateToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1d" });
}

// Local strategy for username/password login
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      console.log("Hi1 ", username, password);

      try {
        const user = await User.findOne({ username });
        if (!user) {
          //Signup
          const salt = await bcrypt.genSalt();
          const hashedPassword = await bcrypt.hash(password, salt);
          const newUser = await User.create({
            username,
            password: hashedPassword,
            salt,
          });
          // return done(null, newUser);
          const token = generateToken({ username, id: newUser._id });
          return done(null, { username, id: newUser._id, token });
        } else {
          //Login
          const hashedPassword = await bcrypt.hash(password, user.salt);
          if (hashedPassword !== user.password) {
            return done(null, false, { message: "Authentication failed" });
          }
          // return done(null, user);
        }
        const token = generateToken({ username, id: user._id });
        return done(null, { username, id: user._id, token });
      } catch (err) {
        return done(err);
      }
    }
  )
);

// JWT strategy for protected routes
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || "🤫",
      passReqToCallback: true,
    },
    async (jwtPayload, done) => {
      console.log("jwtPayload", jwtPayload);

      try {
        const user = await User.findOne({ username: jwtPayload.username });
        user ? done(null, user) : done(null, false);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

export default passport;
