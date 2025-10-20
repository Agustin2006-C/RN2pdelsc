import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { conn } from "./conn.js";

// 🔹 CONFIGURA TUS CREDENCIALES DE GOOGLE:
const GOOGLE_CLIENT_ID = "315886621923-h8fusal5ki8u0fkknrfsg7bunca26u6g.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "TU_CLIENT_SECRET";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;

      const sql = "SELECT * FROM registro_usuarios WHERE username = ?";
      conn.query(sql, [email], (err, result) => {
        if (err) return done(err);

        if (result.length > 0) {
          return done(null, result[0]);
        } else {
          const insertSql =
            "INSERT INTO registro_usuarios(username, pass, provider) VALUES (?, ?, ?)";
          conn.query(insertSql, [email, null, "google"], (err2, newUser) => {
            if (err2) return done(err2);
            return done(null, { id: newUser.insertId, username: email });
          });
        }
      });
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const sql = "SELECT * FROM registro_usuarios WHERE id = ?";
  conn.query(sql, [id], (err, result) => {
    if (err) return done(err);
    done(null, result[0]);
  });
});

export default passport;
