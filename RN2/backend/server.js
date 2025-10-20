import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "./auth.js";
import { conn } from "./conn.js";

const app = express();
const PORT = 3000;

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: "clave_super_segura",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

/* ------------------- LOGIN MANUAL ------------------- */
app.post("/select/users", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(422).json({ error: "Usuario y contraseña requeridos" });

  const sql = "SELECT * FROM registro_usuarios WHERE username = ?";
  conn.query(sql, [username], async (err, result) => {
    if (err) return res.status(400).json({ error: "Error en la DB" });
    if (result.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const checkPass = await bcrypt.compare(password, result[0].pass || "");
    if (!checkPass)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    res.status(200).json({ ok: true, data: result[0] });
  });
});

/* ------------------- REGISTRO MANUAL ------------------- */
app.post("/create/users", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(422).json({ error: "Usuario y contraseña requeridos" });

  if (password.length < 8)
    return res
      .status(411)
      .json({ error: "La contraseña debe tener al menos 8 caracteres" });

  const hashPass = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO registro_usuarios(username, pass) VALUES (?, ?)";

  conn.query(sql, [username, hashPass], (err, result) => {
    if (err?.errno === 1062)
      return res.status(406).json({ error: "El usuario ya existe" });
    if (err) return res.status(400).json({ error: "Error en la DB" });
    res.status(201).json({ ok: true, data: result });
  });
});

/* ------------------- LOGIN CON GOOGLE ------------------- */
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/perfil",
    failureRedirect: "/error",
  })
);

/* ------------------- PERFIL USUARIO ------------------- */
app.put("/update/profile/:id", (req, res) => {
  const { nombre, foto, direccion, telefono, documento } = req.body;
  const { id } = req.params;

  const sql = `
    INSERT INTO perfil_usuarios (user_id, nombre, foto, direccion, telefono, documento)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      nombre = VALUES(nombre),
      foto = VALUES(foto),
      direccion = VALUES(direccion),
      telefono = VALUES(telefono),
      documento = VALUES(documento);
  `;

  conn.query(sql, [id, nombre, foto, direccion, telefono, documento], (err) => {
    if (err)
      return res.status(400).json({ error: "Error al actualizar el perfil" });
    res.status(200).json({ ok: true, message: "Perfil actualizado" });
  });
});

app.get("/perfil", (req, res) => {
  res.send("✅ Inicio de sesión exitoso con Google");
});

app.get("/error", (req, res) => {
  res.send("❌ Error al iniciar sesión con Google");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
