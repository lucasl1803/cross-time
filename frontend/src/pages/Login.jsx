import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import bg from "../assets/Treinando 1.png";
import logo from "../assets/Logo Crosstime.png";
import iconEmail from "../assets/sms.png";
import iconLock from "../assets/cadeado icone.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    navigate("/home"); 
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
       
        <div style={s.left}>
          <div style={s.logoWrap}>
            <img src={logo} alt="CrossTime" style={s.logo} />
          </div>

          <h2 style={s.title}>Entre na sua conta</h2>

          <form onSubmit={onSubmit} style={s.form}>
            <div style={s.inputWrap}>
              <img src={iconEmail} alt="" style={s.icon} />
              <input
                style={s.input}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
              />
            </div>

            <div style={s.inputWrap}>
              <img src={iconLock} alt="" style={s.icon} />
              <input
                style={s.input}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                type="password"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" style={s.btn}>
              LOGIN
            </button>

            <div style={s.footer}>
              Não tem conta?{" "}
              <Link to="/criar-conta" style={s.link}>
                Criar conta
              </Link>
            </div>
          </form>
        </div>

      
        <div style={s.right}>
          <div style={s.bg} />
          <div style={s.fade} />
        </div>
      </div>
    </div>
  );
}

const s = {
 
  page: {
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    background: "#1E1E1E",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
    fontFamily: "Inter, Arial, sans-serif",
  },


  card: {
    width: "100%",
    height: "100%",
    background: "#1E1E1E",
    borderRadius: 0,
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "460px 1fr", 
    boxShadow: "none",
  },

  left: {
    background: "#003637",
    padding: "70px 56px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 24,
  },

  logoWrap: { display: "flex", alignItems: "center" },
  logo: { height: 90, objectFit: "contain" },

  title: {
    margin: 0,
    color: "#E2F163",
    fontWeight: 800,
    fontSize: 34,
    lineHeight: 1.15,
  },

  form: { display: "flex", flexDirection: "column", gap: 16 },

  inputWrap: {
    height: 48,
    background: "#F0F0F0",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 16px",
  },

  icon: { width: 18, height: 18, opacity: 0.95 },

  input: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: 15,
    color: "#111",
  },

  btn: {
    width: 170,
    height: 44,
    border: "none",
    borderRadius: 12,
    background: "#E2F163",
    color: "#111",
    fontWeight: 900,
    fontSize: 14,
    cursor: "pointer",
    marginTop: 12,
  },

  footer: {
    marginTop: 16,
    color: "rgba(255,255,255,.80)",
    fontSize: 14,
  },

  link: { color: "#E2F163", fontWeight: 800, textDecoration: "none" },

  right: {
    position: "relative",
    background: "#111",
  },

  bg: {
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transform: "scale(1.03)",
  },

  
  fade: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(0,0,0,.10) 0%, rgba(0,0,0,.45) 55%, rgba(0,0,0,.78) 100%)",
  },
};
