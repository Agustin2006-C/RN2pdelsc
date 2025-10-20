import mysql from "mysql2";

export const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "login_db",
});

conn.connect((err) => {
  if (err) {
    console.log("❌ Error al conectar con MySQL:", err);
  } else {
    console.log("✅ Conectado a MySQL");
  }
});
