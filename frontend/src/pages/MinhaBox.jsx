import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE = {
  PERFIL: "perfil",
  BOX_NAME: "box:nome",
  BOX_EMAILS: "box:emails",
  BOX_AULAS: "box:aulas",
};


function safeParseJSON(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function loadArray(key) {
  const raw = localStorage.getItem(key);
  const parsed = safeParseJSON(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function isValidEmail(email) {
  const e = email.trim().toLowerCase();
  return e.includes("@") && e.includes(".");
}

export default function MinhaBox() {
  const navigate = useNavigate();

const perfil = localStorage.getItem(STORAGE.PERFIL);
const isCoach = perfil === "ADMIN";

useEffect(() => {
  if (!isCoach) navigate("/home");
}, [isCoach, navigate]);


 
  const [boxNome, setBoxNome] = useState(() => localStorage.getItem(STORAGE.BOX_NAME) || "");
  const [boxSavedMsg, setBoxSavedMsg] = useState("");

  function salvarNomeBox() {
    const nome = boxNome.trim();
    if (!nome) return;
    localStorage.setItem(STORAGE.BOX_NAME, nome);
    setBoxSavedMsg("Salvo!");
    window.setTimeout(() => setBoxSavedMsg(""), 1200);
  }

 // autoriza email alunos
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState(() => loadArray(STORAGE.BOX_EMAILS));

  const [aulas, setAulas] = useState(() => loadArray(STORAGE.BOX_AULAS));
  const [aulaForm, setAulaForm] = useState({
    horario: "",
    modalidade: "",
    coach: "",
    descricao: "",
  });

  useEffect(() => saveJSON(STORAGE.BOX_EMAILS, emails), [emails]);
  useEffect(() => saveJSON(STORAGE.BOX_AULAS, aulas), [aulas]);

  function addEmail(e) {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!isValidEmail(email)) return;
    if (emails.includes(email)) {
      setEmailInput("");
      return;
    }
    setEmails((prev) => [...prev, email]);
    setEmailInput("");
  }

  function removeEmail(email) {
    setEmails((prev) => prev.filter((x) => x !== email));
  }

  function onAulaChange(e) {
    const { name, value } = e.target;
    setAulaForm((prev) => ({ ...prev, [name]: value }));
  }

  function addAula(e) {
    e.preventDefault();

    const horario = aulaForm.horario.trim();
    const modalidade = aulaForm.modalidade.trim();
    const coach = aulaForm.coach.trim();
    const descricao = aulaForm.descricao.trim();

    if (!horario || !modalidade || !coach) return;

    const nova = {
      id: crypto.randomUUID(),
      horario,
      modalidade,
      coach: coach.toLowerCase().startsWith("coach") ? coach : `Coach ${coach}`,
      descricao,
      inscritos: 0,
      capacidade: 0,
    };

    setAulas((prev) => [...prev, nova].sort((a, b) => a.horario.localeCompare(b.horario)));
    setAulaForm({ horario: "", modalidade: "", coach: "", descricao: "" });
  }

  function removeAula(id) {
    setAulas((prev) => prev.filter((a) => a.id !== id));
  }

  const alunosCount = emails.length;
  const aulasCount = aulas.length;

  const aulasPreview = useMemo(() => aulas, [aulas]);

  return (
    <div style={s.page}>
      <aside style={s.nav}>
        <div style={s.brand}>
          <span style={s.brandCross}>CROSS</span>
          <span style={s.brandTime}>TIME</span>
        </div>

        <div style={s.navItems}>
          <div style={s.navItemIdle} onClick={() => navigate("/home")} role="button">
  Home
</div>



          <div style={s.navItemActive}>Minha Box</div>
        </div>

        <div style={s.bottom}>
       <button

  type="button"
  style={s.logoutBtn}
  onClick={() => {
    localStorage.removeItem("perfil");
    localStorage.removeItem("usuarioId");
    navigate("/login");
  }}
>
  Sair
</button>


          <div style={s.modePill}>Modo Coach</div>
        </div>
      </aside>

      <main style={s.content}>
        <section style={s.headerCard}>
          <div>
            <div style={s.hello}>Gerenciar Box</div>
          

            
            <div style={s.boxRow}>
              <input
                style={s.boxInput}
                placeholder="Nome da Box (ex: RedBunker)"
                value={boxNome}
                onChange={(e) => setBoxNome(e.target.value)}
              />
              <button style={s.btnPrimary} type="button" onClick={salvarNomeBox}>
                Salvar
              </button>

              {boxSavedMsg ? <span style={s.savedMsg}>{boxSavedMsg}</span> : null}
            </div>
          </div>

          <div style={s.badge}>
            Alunos: <strong>{alunosCount}</strong> , Aulas: <strong>{aulasCount}</strong>
          </div>
        </section>

        <div style={s.grid}>
          {/* EMAILS */}
          <section style={s.card}>
            <div style={s.cardTitle}>Cadastre seus alunos</div>

            <form onSubmit={addEmail} style={s.row}>
              <input
                style={s.input}
                placeholder="email@exemplo.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <button style={s.btnPrimary} type="submit">
                Adicionar
              </button>
            </form>

            <div style={s.list}>
              {emails.length === 0 ? (
                <div style={s.empty}>Nenhum e-mail cadastrado ainda.</div>
              ) : (
                emails.map((email) => (
                  <div key={email} style={s.listItem}>
                    <span>{email}</span>
                    <button style={s.btnDanger} onClick={() => removeEmail(email)} type="button">
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* AULAS */}
          <section style={s.card}>
            <div style={s.cardTitle}>Adicione uma nova Aula</div>

            <form onSubmit={addAula} style={s.form}>
              <div style={s.row}>
                <input
                  style={s.input}
                  name="horario"
                  placeholder="Horário (ex: 07:00)"
                  value={aulaForm.horario}
                  onChange={onAulaChange}
                />
                <input
                  style={s.input}
                  name="modalidade"
                  placeholder="Nome da aula (ex: Crossfit)"
                  value={aulaForm.modalidade}
                  onChange={onAulaChange}
                />
              </div>

              <input
                style={s.input}
                name="coach"
                placeholder="Coach"
                value={aulaForm.coach}
                onChange={onAulaChange}
              />

              <textarea
                style={s.textarea}
                name="descricao"
                placeholder="WOD (opcional)"
                value={aulaForm.descricao}
                onChange={onAulaChange}
              />

              <button style={s.btnPrimaryWide} type="submit">
                Adicionar aula
              </button>
            </form>

            <div style={s.list}>
              {aulasPreview.length === 0 ? (
                <div style={s.empty}>Nenhuma aula cadastrada ainda.</div>
              ) : (
                aulasPreview.map((a) => (
                  <div key={a.id} style={s.listItem}>
                    <div>
                      <div style={s.aulaLine}>
                        <strong style={s.time}>{a.horario}</strong>
                        <span style={s.aulaName}>{a.modalidade}</span>
                      </div>
                      <div style={s.muted}>
                        {a.coach}
                        {a.descricao ? ` , ${a.descricao}` : ""}
                      </div>
                    </div>

                    <button style={s.btnDanger} onClick={() => removeAula(a.id)} type="button">
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const s = {
  page: {
    height: "100vh",
    overflow: "hidden",
    background: "#1E1E1E",
    color: "rgba(255,255,255,.92)",
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    fontFamily: "Poppins, Inter, Arial, sans-serif",
  },

  nav: {
    background: "#003637",
    borderRight: "1px solid rgba(255,255,255,.08)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
  },

  brand: { display: "flex", alignItems: "baseline", marginBottom: 26 },
  brandCross: { color: "#E2F163", fontWeight: 900, fontSize: 40, lineHeight: 1 },
  brandTime: { color: "#E2F163", fontWeight: 800, fontStyle: "italic", fontSize: 40, lineHeight: 1, marginLeft: 2 },

  navItems: { display: "flex", flexDirection: "column", gap: 12 },

  navItemIdle: {
    padding: "14px 16px",
    borderRadius: 14,
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    userSelect: "none",
    transition: "all .15s ease",
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(0,0,0,.10)",
    color: "rgba(255,255,255,.82)",
  },

  navItemActive: {
    padding: "14px 16px",
    borderRadius: 14,
    fontWeight: 800,
    fontSize: 15,
    userSelect: "none",
    border: "1px solid rgba(226,241,99,.45)",
    background: "rgba(226,241,99,.12)",
    color: "#E2F163",
  },

  bottom: {
    marginTop: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 18,
  },

  logout: {
    color: "rgba(255,255,255,.82)",
    textDecoration: "none",
    fontSize: 14,
    opacity: 0.9,
  },

  modePill: {
    border: "1px solid rgba(226,241,99,.35)",
    background: "rgba(226,241,99,.10)",
    color: "#E2F163",
    fontWeight: 900,
    fontSize: 12,
    padding: "10px 14px",
    borderRadius: 12,
    width: "fit-content",
  },

  content: {
    padding: 40,
    display: "flex",
    flexDirection: "column",
    gap: 18,
    height: "100vh",
    overflow: "hidden",
    minHeight: 0,
    background:
      "radial-gradient(1200px 600px at 20% 0%, rgba(255,255,255,.06) 0%, rgba(255,255,255,0) 50%)",
  },

  headerCard: {
    background: "#2A2A2A",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 18,
    padding: "20px 22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    boxShadow: "0 14px 34px rgba(0,0,0,.25)",
    flexShrink: 0,
    gap: 18,
  },

  hello: { fontWeight: 900, fontSize: 26 },
  sub: { marginTop: 6, opacity: 0.85, fontSize: 13 },

  boxRow: {
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  boxInput: {
    width: "min(520px, 70vw)",
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(0,0,0,.18)",
    color: "rgba(255,255,255,.92)",
    outline: "none",
    padding: "0 12px",
    fontSize: 14,
  },

  savedMsg: {
    color: "#E2F163",
    fontWeight: 900,
    fontSize: 12,
    opacity: 0.95,
  },

  badge: {
    border: "1px solid rgba(226,241,99,.35)",
    background: "rgba(226,241,99,.10)",
    padding: "10px 14px",
    borderRadius: 999,
    fontSize: 13,
    color: "rgba(255,255,255,.92)",
    whiteSpace: "nowrap",
    alignSelf: "flex-start",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    overflow: "auto",
    paddingRight: 10,
  },

  card: {
    background: "#232323",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 12px 28px rgba(0,0,0,.22)",
    minHeight: 280,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  cardTitle: { fontWeight: 900, color: "#E2F163", fontSize: 16 },

  row: { display: "flex", gap: 10, alignItems: "center" },

  form: { display: "flex", flexDirection: "column", gap: 10 },

  input: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(0,0,0,.18)",
    color: "rgba(255,255,255,.92)",
    outline: "none",
    padding: "0 12px",
    fontSize: 14,
  },

  textarea: {
    minHeight: 70,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(0,0,0,.18)",
    color: "rgba(255,255,255,.92)",
    outline: "none",
    padding: "10px 12px",
    fontSize: 14,
    resize: "vertical",
  },

  list: { display: "flex", flexDirection: "column", gap: 10, marginTop: 6, overflow: "auto" },

  listItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.08)",
    background: "rgba(0,0,0,.14)",
  },

  empty: { opacity: 0.7, fontSize: 13 },

  btnPrimary: {
    height: 42,
    padding: "0 14px",
    borderRadius: 12,
    border: "none",
    background: "#E2F163",
    color: "#111",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  btnPrimaryWide: {
    height: 44,
    padding: "0 14px",
    borderRadius: 12,
    border: "none",
    background: "#E2F163",
    color: "#111",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
    width: "100%",
    marginTop: 6,
  },

  btnDanger: {
    height: 36,
    padding: "0 12px",
    borderRadius: 12,
    border: "1px solid rgba(226,241,99,.35)",
    background: "rgba(226,241,99,.10)",
    color: "#E2F163",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  aulaLine: { display: "flex", alignItems: "baseline", gap: 10 },
  time: { color: "#E2F163" },
  aulaName: { fontWeight: 900 },
  muted: { opacity: 0.72, fontSize: 13, marginTop: 2 },

  logoutBtn: {
  background: "transparent",
  border: "none",
  padding: 0,
  color: "rgba(255,255,255,.82)",
  fontSize: 14,
  cursor: "pointer",
  opacity: 0.9,
},

};
