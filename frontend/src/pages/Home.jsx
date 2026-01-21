import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import userIcon from "../assets/Usuarioicone.png";
import { listarSessoes } from "../services/sessoes";

const STORAGE = {
  BOX_NAME: "box:nome",
  BOX_AULAS: "box:aulas",
  ROLE: "role",
};

// ✅ HOTFIX HOJE: ID da assinatura que existe no seu Prisma Studio
const ASSINATURA_DEMO_ID = 1;

const mockSessoes = [
  { id: 1, horario: "06:00", modalidade: "Crossfit", coach: "Coach Flávia", inscritos: 0, capacidade: 0 },
  { id: 2, horario: "07:00", modalidade: "Crossfit", coach: "Coach Flávia", inscritos: 0, capacidade: 0 },
  { id: 3, horario: "08:00", modalidade: "Crossfit", coach: "Coach Bruno", inscritos: 0, capacidade: 0 },
  { id: 4, horario: "12:15", modalidade: "Crossfit", coach: "Coach Flávia", inscritos: 0, capacidade: 0 },
  { id: 5, horario: "16:30", modalidade: "Crossfit", coach: "Coach Ana Luiza", inscritos: 0, capacidade: 0 },
  { id: 6, horario: "17:30", modalidade: "Crossfit", coach: "Coach Bruno", inscritos: 0, capacidade: 0 },
  { id: 7, horario: "18:30", modalidade: "Crossfit", coach: "Coach Ana Luiza", inscritos: 0, capacidade: 0 },
];

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

export default function Home() {
  const navigate = useNavigate();

  const role = localStorage.getItem(STORAGE.ROLE) || "ALUNO";
  const isCoach = role === "COACH";

  const boxNome = localStorage.getItem(STORAGE.BOX_NAME) || "Sua Box";

  const [sessoesApi, setSessoesApi] = useState([]);

  useEffect(() => {
    async function carregarSessoes() {
      try {
        const data = await listarSessoes();

        const mapped = data.map((x) => {
          const horario = new Date(x.horaInicio).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return {
            id: x.id,
            horario,
            modalidade: x.wod?.titulo || "Aula",
            coach: "",
            inscritos: 0,
            capacidade: x.capacidade ?? 0,
            duracaoMin: x.duracaoMinutos,
            status: x.status,
          };
        });

        setSessoesApi(mapped);
      } catch (err) {
        console.error("Erro ao carregar sessoes:", err);
      }
    }

    carregarSessoes();
  }, []);

  const sessoes = useMemo(() => {
    const aulasDaBox = loadArray(STORAGE.BOX_AULAS);
    if (aulasDaBox.length > 0) return aulasDaBox;
    return mockSessoes;
  }, []);

  const [reservas, setReservas] = useState({});
  const [hoverId, setHoverId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSessao, setSelectedSessao] = useState(null);

  const qtdReservasHoje = Object.keys(reservas).length;

  function openModal(sessao) {
    setSelectedSessao(sessao);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedSessao(null);
  }

  function confirmarReserva() {
    if (!selectedSessao) return;

    setReservas((prev) => ({
      ...prev,
      [selectedSessao.id]: "PENDENTE",
    }));

    closeModal();
  }

  function cancelarReserva() {
    if (!selectedSessao) return;

    setReservas((prev) => {
      const copy = { ...prev };
      delete copy[selectedSessao.id];
      return copy;
    });

    closeModal();
  }

  function marcarComoConfirmado() {
    if (!selectedSessao) return;

    setReservas((prev) => ({
      ...prev,
      [selectedSessao.id]: "CONFIRMADO",
    }));

    closeModal();
  }

  const selectedStatus = selectedSessao ? reservas[selectedSessao.id] : undefined;
  const sessoesFinal = sessoesApi.length > 0 ? sessoesApi : sessoes;

  return (
    <div style={s.page}>
      <aside style={s.nav}>
        <div style={s.brand}>
          <span style={s.brandCross}>CROSS</span>
          <span style={s.brandTime}>TIME</span>
        </div>

        <div style={s.navItems}>
          <div style={{ ...s.navItem, ...s.navItemActive }}>Home</div>

          {isCoach && (
            <div
              style={{ ...s.navItem, ...s.navItemIdle }}
              onClick={() => navigate("/minha-box")}
              role="button"
              title="Gerenciar sua Box"
            >
              Minha Box
            </div>
          )}
        </div>

        <div style={s.bottom}>
          <a href="/login" style={s.logout}>
            Sair
          </a>

          <div style={s.modePill}>{isCoach ? "Modo Coach" : "Modo Aluno"}</div>
        </div>
      </aside>

      <main style={s.content}>
        <section style={s.headerCard}>
          <div>
            <div style={s.hello}>Olá, Lucas!</div>
            <div style={s.subtitle}>Vamos realizar o check-in hoje?</div>
          </div>

          <div style={s.headerRight}>
            <div style={s.boxName}>{boxNome}</div>

            {!isCoach ? (
              <div style={s.reservasText}>
                Minhas reservas: <strong>{qtdReservasHoje}</strong>
              </div>
            ) : null}
          </div>
        </section>

        <section style={s.listWrap}>
          <div style={s.list}>
            {sessoesFinal.map((sessao) => {
              const isHover = hoverId === sessao.id;

              const status = reservas[sessao.id];
              const isPending = status === "PENDENTE";
              const isConfirmed = status === "CONFIRMADO";

              const inscritos = Number(sessao.inscritos ?? 0);
              const capacidade = Number(sessao.capacidade ?? 0);

              return (
                <div
                  key={sessao.id}
                  onMouseEnter={() => setHoverId(sessao.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => openModal(sessao)}
                  style={{
                    ...s.card,
                    ...(isHover ? s.cardHover : null),
                    ...(isPending ? s.cardPending : null),
                    ...(isConfirmed ? s.cardConfirmed : null),
                  }}
                  title="Clique para ver opções"
                  role="button"
                >
                  <div style={s.cardLeft}>
                    <div style={s.time}>{sessao.horario}</div>

                    <div>
                      <div style={s.modality}>{sessao.modalidade}</div>
                      <div style={s.coach}>
                        {sessao.coach}
                        {sessao.duracaoMin ? ` • ${sessao.duracaoMin} min` : ""}
                      </div>

                      {isPending && (
                        <div style={s.tagRow}>
                          <div style={s.tagPending}>Pendente</div>

                          {/* ✅ HOTFIX HOJE: sempre manda ID numérico da assinatura */}
                          <button
                            style={s.payBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("DEBUG: indo pro pagamento", { assinaturaId: ASSINATURA_DEMO_ID });
                              navigate(`/pagamento/${ASSINATURA_DEMO_ID}`);
                            }}
                          >
                            Pagar
                          </button>
                        </div>
                      )}

                      {isConfirmed && <div style={s.tagConfirmed}>Confirmado</div>}
                    </div>
                  </div>

                  <div style={s.cardRight}>
                    <span style={s.spots}>
                      {inscritos}/{capacidade}
                    </span>

                    <span style={s.userPill}>
                      <img src={userIcon} alt="" style={s.userIcon} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {modalOpen && (
        <div style={s.modalOverlay} onClick={closeModal} role="presentation">
          <div
            style={s.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>
                {selectedStatus ? "Gerenciar reserva" : "Confirmar reserva"}
              </div>
              <button style={s.modalClose} onClick={closeModal} aria-label="Fechar">
                ✕
              </button>
            </div>

            <div style={s.modalBody}>
              <div style={s.modalLine}>
                <span style={s.modalLabel}>Horário</span>
                <span style={s.modalValue}>{selectedSessao?.horario}</span>
              </div>

              <div style={s.modalLine}>
                <span style={s.modalLabel}>Aula</span>
                <span style={s.modalValue}>{selectedSessao?.modalidade}</span>
              </div>

              <div style={s.modalLine}>
                <span style={s.modalLabel}>Coach</span>
                <span style={s.modalValue}>{selectedSessao?.coach}</span>

                {selectedSessao?.duracaoMin ? (
                  <div style={s.modalLine}>
                    <span style={s.modalLabel}>Duração</span>
                    <span style={s.modalValue}>{selectedSessao.duracaoMin} min</span>
                  </div>
                ) : null}
              </div>

              {selectedSessao?.descricao ? (
                <div style={s.modalDesc}>
                  <span style={s.modalLabel}>Descrição</span>
                  <div style={s.modalDescText}>{selectedSessao.descricao}</div>
                </div>
              ) : null}

              <div style={s.modalHint}>
                {selectedStatus
                  ? `Status atual: ${
                      selectedStatus === "PENDENTE" ? "Pagamento pendente" : "Pagamento confirmado"
                    }`
                  : "Confirme a reserva para seguir para o pagamento e garantir sua vaga na aula."}
              </div>
            </div>

            <div style={s.modalActions}>
              <button style={s.btnGhost} onClick={closeModal}>
                Voltar
              </button>

              {selectedStatus ? (
                <>
                  <button style={s.btnDanger} onClick={cancelarReserva}>
                    Cancelar reserva
                  </button>

                  {selectedStatus === "PENDENTE" && (
                    <button style={s.btnPrimary} onClick={marcarComoConfirmado}>
                      Marcar como confirmado
                    </button>
                  )}
                </>
              ) : (
                <button style={s.btnPrimary} onClick={confirmarReserva}>
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ⬇️ estilos: mantém os seus (não alterei nada aqui)
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
  brand: {
    display: "flex",
    alignItems: "baseline",
    marginBottom: 26,
    letterSpacing: "0.02em",
  },
  brandCross: { color: "#E2F163", fontWeight: 900, fontSize: 40, lineHeight: 1 },
  brandTime: {
    color: "#E2F163",
    fontWeight: 800,
    fontStyle: "italic",
    fontSize: 40,
    lineHeight: 1,
    marginLeft: 2,
  },
  navItems: { display: "flex", flexDirection: "column", gap: 12 },
  navItem: {
    padding: "14px 16px",
    borderRadius: 14,
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    userSelect: "none",
    transition: "all .15s ease",
  },
  navItemIdle: {
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(0,0,0,.10)",
    color: "rgba(255,255,255,.82)",
  },
  navItemActive: {
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
    alignItems: "center",
    boxShadow: "0 14px 34px rgba(0,0,0,.25)",
    flexShrink: 0,
    gap: 16,
  },
  hello: { color: "rgba(255,255,255,.92)", fontWeight: 900, fontSize: 28 },
  subtitle: { marginTop: 6, opacity: 0.85, fontSize: 13 },
  headerRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 },
  boxName: { color: "#E2F163", fontWeight: 900, fontSize: 22, letterSpacing: "0.02em" },
  reservasText: { fontSize: 13, opacity: 0.9, color: "rgba(255,255,255,.92)" },
  listWrap: { flex: 1, overflowY: "auto", minHeight: 0, paddingRight: 10 },
  list: { display: "flex", flexDirection: "column", gap: 14, maxWidth: 900, paddingBottom: 24 },
  card: {
    background: "#232323",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 16,
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 12px 28px rgba(0,0,0,.22)",
    transition: "all .15s ease",
    cursor: "pointer",
    flexShrink: 0,
  },
  cardHover: {
    background: "#2D2D2D",
    border: "1px solid rgba(226,241,99,.18)",
    boxShadow: "0 16px 36px rgba(0,0,0,.32)",
    transform: "translateY(-1px)",
  },
  cardPending: { border: "1px solid rgba(226,241,99,.40)", background: "rgba(226,241,99,.08)" },
  cardConfirmed: { border: "1px solid rgba(60,255,127,.35)", background: "rgba(60,255,127,.08)" },
  cardLeft: { display: "flex", alignItems: "center", gap: 20 },
  time: { color: "#E2F163", fontWeight: 900, width: 90, fontSize: 22 },
  modality: { fontWeight: 850, color: "rgba(255,255,255,.92)", fontSize: 18 },
  coach: { fontSize: 13, color: "rgba(255,255,255,.62)", marginTop: 2 },
  tagRow: { marginTop: 10, display: "flex", alignItems: "center", gap: 10 },
  tagPending: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.06em",
    color: "#111",
    background: "#E2F163",
    padding: "5px 12px",
    borderRadius: 999,
    width: "fit-content",
  },
  tagConfirmed: {
    marginTop: 10,
    display: "inline-block",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.06em",
    color: "#0B1413",
    background: "#3CFF7F",
    padding: "5px 12px",
    borderRadius: 999,
    width: "fit-content",
  },
  payBtn: {
    height: 30,
    padding: "0 12px",
    borderRadius: 999,
    border: "none",
    background: "#3CFF7F",
    color: "#0B1413",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
  },
  cardRight: { display: "flex", alignItems: "center", gap: 14 },
  spots: { fontSize: 14, color: "rgba(255,255,255,.78)", fontWeight: 700 },
  userPill: {
    width: 34,
    height: 34,
    borderRadius: 999,
    border: "1px solid rgba(226,241,99,.30)",
    background: "rgba(226,241,99,.10)",
    display: "grid",
    placeItems: "center",
  },
  userIcon: { width: 18, height: 18, opacity: 0.95 },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    zIndex: 999,
  },
  modalCard: {
    width: "min(560px, 92vw)",
    background: "#2A2A2A",
    border: "1px solid rgba(255,255,255,.10)",
    borderRadius: 18,
    boxShadow: "0 22px 70px rgba(0,0,0,.55)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 18px",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },
  modalTitle: { fontWeight: 900, fontSize: 16, color: "rgba(255,255,255,.92)" },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(0,0,0,.20)",
    color: "rgba(255,255,255,.85)",
    cursor: "pointer",
    fontSize: 16,
  },
  modalBody: { padding: "16px 18px" },
  modalLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,.06)",
  },
  modalDesc: { padding: "12px 0" },
  modalDescText: {
    marginTop: 6,
    color: "rgba(255,255,255,.86)",
    fontSize: 13,
    lineHeight: 1.45,
    background: "rgba(0,0,0,.14)",
    border: "1px solid rgba(255,255,255,.06)",
    borderRadius: 12,
    padding: "10px 12px",
  },
  modalLabel: { color: "rgba(255,255,255,.65)", fontSize: 13, fontWeight: 700 },
  modalValue: { color: "rgba(255,255,255,.92)", fontSize: 14, fontWeight: 800 },
  modalHint: { marginTop: 14, color: "rgba(255,255,255,.72)", fontSize: 13, lineHeight: 1.4 },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "16px 18px",
    borderTop: "1px solid rgba(255,255,255,.08)",
    flexWrap: "wrap",
  },
  btnGhost: {
    height: 42,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(0,0,0,.14)",
    color: "rgba(255,255,255,.86)",
    fontWeight: 900,
    cursor: "pointer",
  },
  btnPrimary: { height: 42, padding: "0 16px", borderRadius: 12, border: "none", background: "#E2F163", color: "#111", fontWeight: 900, cursor: "pointer" },
  btnDanger: { height: 42, padding: "0 16px", borderRadius: 12, border: "1px solid rgba(226,241,99,.35)", background: "rgba(226,241,99,.10)", color: "#E2F163", fontWeight: 900, cursor: "pointer" },
};
