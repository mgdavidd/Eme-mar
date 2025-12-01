import React, { useState } from "react";
import styles from "./Login.module.css";
import Alert from "../../components/Alert";

export default function Login() {
  const [form, setForm] = useState({ password: "" });
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login data:", form);
    if (form.password === "vicrisda2164") {
      //redirijir a la pagina principal
      window.location.href = "/dashboard";
    }
    else {
      setAlert("Contraseña incorrecta. Por favor, inténtalo de nuevo.");
    }

  };

  return (
    <div className={styles.page}>
        {alert && <Alert type="error" message={alert} onClose={() => setAlert(null)} />}
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar Sesión</h1>
        <p className={styles.subtitle}>Bienvenido al sistema de lociones</p>

        <form className={styles.form} onSubmit={handleSubmit}>

          <label className={styles.label}>Contraseña</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            className={styles.input}
            onChange={handleChange}
            required
          />

          <button type="submit" className={styles.button}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
