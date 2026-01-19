import { api } from "./api";

export async function listarSessoes(date) {
  const params = date ? { date } : undefined;
  const { data } = await api.get("/sessoes", { params });
  return data;
}
