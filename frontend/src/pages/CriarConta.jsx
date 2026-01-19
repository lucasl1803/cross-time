import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from "../assets/Logo Crosstime.png";
import iconEmail from "../assets/sms.png";
import iconLock from "../assets/cadeado icone.png";

export default function CriarConta() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    tipo: "ALUNO",
  });

  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return (
      form.nome.trim() &&
      form.email.trim() &&
      form.senha.trim() &&
      form.confirmarSenha.trim()
    );
  }, [form]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!canSubmit) {
      setError("Preencha todos os campos.");
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      setError("As senhas não conferem.");
      return;
    }

    
    localStorage.setItem("role", form.tipo);

    navigate("/home");
  }

  return (
    <div style={s.page}>
      <div style={s.layout}>
        <aside style={s.left}>
          <img src={logo} alt="CrossTime" style={s.leftLogo} />
        </aside>

        <main style={s.right}>
          <div style={s.center}>
            <h1 style={s.title}>Crie sua conta</h1>
            <p style={s.subtitle}>Preencha seus dados</p>

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.inputWrap}>
                <input
                  style={s.input}
                  name="nome"
                  type="text"
                  placeholder="Nome"
                  value={form.nome}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>

              <div style={s.inputWrap}>
                <img src={iconEmail} alt="" style={s.icon} />
                <input
                  style={s.input}
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div style={s.inputWrap}>
                <img src={iconLock} alt="" style={s.icon} />
                <input
                  style={s.input}
                  name="senha"
                  type="password"
                  placeholder="Senha"
                  value={form.senha}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>

              <div style={s.inputWrap}>
                <img src={iconLock} alt="" style={s.icon} />
                <input
                  style={s.input}
                  name="confirmarSenha"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>

              {error ? <div style={s.error}>{error}</div> : null}

              
              <div style={s.roleWrap}>
                <span style={s.roleLabel}>Tipo de conta</span>

                <div style={s.roleOptions}>
                  <label style={s.roleOption}>
                    <input
                      type="radio"
                      name="tipo"
                      value="ALUNO"
                      checked={form.tipo === "ALUNO"}
                      onChange={handleChange}
                    />
                    Aluno
                  </label>

                  <label style={s.roleOption}>
                    <input
                      type="radio"
                      name="tipo"
                      value="COACH"
                      checked={form.tipo === "COACH"}
                      onChange={handleChange}
                    />
                    Coach
                  </label>
                </div>
              </div>

              <button
                type="submit"
                style={{ ...s.btn, opacity: canSubmit ? 1 : 0.55 }}
                disabled={!canSubmit}
              >
                CRIAR CONTA
              </button>

              <div style={s.hint}>
                Já tem conta?{" "}
                <Link to="/login" style={s.link}>
                  Voltar ao login
                </Link>
              </div>
            </form>
          </div>
        </main>
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
    fontFamily: "Inter, Arial, sans-serif",
  },

  layout: {
    width: "100%",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "460px 1fr",
    overflow: "hidden",
  },

  left: {
    background: "#003637",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 36,
  },

  leftLogo: {
    width: "min(340px, 80%)",
    height: "auto",
    objectFit: "contain",
  },

  right: {
    background: "#1E1E1E",
    display: "grid",
    placeItems: "center",
    padding: 24,
  },

  center: {
    width: "min(520px, 92%)",
    textAlign: "center",
  },

  title: {
    margin: 0,
    color: "#E2F163",
    fontWeight: 900,
    fontSize: 34,
    lineHeight: 1.1,
  },

  subtitle: {
    margin: "6px 0 22px",
    color: "rgba(226,241,99,.9)",
    fontSize: 14,
    opacity: 0.9,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    alignItems: "center",
  },

  inputWrap: {
    width: "100%",
    height: 44,
    background: "#F0F0F0",
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 16px",
  },

  icon: { width: 18, height: 18, opacity: 0.95 },

  input: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: 14,
    color: "#111",
  },

  btn: {
    width: 200,
    height: 44,
    border: "none",
    borderRadius: 12,
    background: "#E2F163",
    color: "#111",
    fontWeight: 900,
    fontSize: 14,
    cursor: "pointer",
    marginTop: 8,
  },

  error: {
    width: "100%",
    fontSize: 12,
    color: "#ffd2d2",
    background: "rgba(255,0,0,.12)",
    border: "1px solid rgba(255,0,0,.25)",
    padding: "10px 12px",
    borderRadius: 12,
    textAlign: "left",
  },

  hint: {
    marginTop: 10,
    color: "rgba(255,255,255,.70)",
    fontSize: 14,
  },

  link: { color: "#E2F163", fontWeight: 800, textDecoration: "none" },

  roleWrap: {
    width: "100%",
    marginTop: 6,
    textAlign: "left",
  },

  roleLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,.8)",
    fontWeight: 700,
    marginBottom: 6,
    display: "block",
  },

  roleOptions: {
    display: "flex",
    gap: 20,
    paddingLeft: 6,
  },

  roleOption: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 14,
    color: "rgba(255,255,255,.9)",
    cursor: "pointer",
  },
};
