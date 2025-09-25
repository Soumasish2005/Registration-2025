"use client";
import { useState } from "react";
import styles from "./admin.module.css";

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string|null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== "debtanu.operations.script@gmail.com") {
      setError("Invalid email");
      return;
    }
    if (code !== "CYM92025") {
      setError("Invalid secret code");
      return;
    }
    setError(null);
    onLogin();
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Admin Login</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form className={styles.form} onSubmit={handleLogin}>
        <div>
          <label className={styles.label}>Gmail ID</label>
          <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className={styles.label}>Secret Code</label>
          <input className={styles.input} type="password" value={code} onChange={e => setCode(e.target.value)} required />
        </div>
        <div style={{textAlign: "right"}}>
          <button className={styles.button} type="submit">Login</button>
        </div>
      </form>
    </div>
  );
}
