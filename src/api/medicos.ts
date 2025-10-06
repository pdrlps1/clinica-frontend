import { http } from "./http";

export type Medico = {
  id: number;
  nome: string;
  email: string;
  crm: string;
  especialidade?: string;
  telefone?: string;
};

export type MedicoRequest = Omit<Medico, "id">;

export async function listarMedicos() {
  const { data } = await http.get<Medico[]>("/medicos");
  return data;
}

export async function criarMedico(req: MedicoRequest) {
  const { data } = await http.post<Medico>("/medicos", req);
  return data;
}

export async function atualizarMedico(id: number, req: MedicoRequest) {
  const { data } = await http.put<Medico>(`/medicos/${id}`, req);
  return data;
}

export async function deletarMedico(id: number) {
  await http.delete<void>(`/medicos/${id}`);
}
