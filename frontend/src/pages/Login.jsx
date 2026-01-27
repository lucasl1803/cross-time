import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

import bg from "../assets/Treinando 1.png";
import logo from "../assets/Logo Crosstime.png";
import iconEmail from "../assets/sms.png";
import iconLock from "../assets/cadeado icone.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState(""); 
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
      });

      const usuario = response.data;

      const emailNorm = email.toLowerCase().trim();
      localStorage.setItem("email", emailNorm);


      localStorage.setItem("usuarioId", usuario.id);
      localStorage.setItem("perfil", usuario.tipo);
      localStorage.setItem("email", usuario.email);


      if (usuario.tipo === "ALUNO") {
        navigate("/home");
      } else {
        navigate("/minha-box");

      }
    } catch {
      setError("Email não autorizado para acesso.");
    }
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
                required
              />
            </div>

            <div style={s.inputWrap}>
              <img src={iconLock} alt="" style={s.icon} />
              <input
                style={s.input}
                placeholder="Senha "
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                type="password"
              />
            </div>

            {error && (
              <div style={{ color: "#ffd2d2", fontSize: 13 }}>{error}</div>
            )}

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
    display: "grid",
    gridTemplateColumns: "460px 1fr",
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
  logo: { height: 90 },

  title: {
    margin: 0,
    color: "#E2F163",
    fontWeight: 800,
    fontSize: 34,
    lineHeight: 1.15,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  inputWrap: {
    height: 48,
    background: "#F0F0F0",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 16px",
  },

  icon: { width: 18, height: 18 },

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
    color: "rgba(255,255,255,.8)",
    fontSize: 14,
  },

  link: {
    color: "#E2F163",
    fontWeight: 800,
    textDecoration: "none",
  },

  right: { position: "relative" },

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
      "linear-gradient(90deg, rgba(0,0,0,.1) 0%, rgba(0,0,0,.45) 55%, rgba(0,0,0,.78) 100%)",
  },
};
