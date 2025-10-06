import { http } from "./http";

export type ConsultaStatus = "AGENDADA" | "CANCELADA" | "CONCLUIDA";

export type Consulta = {
  id: number;
  pacienteId: number;
  pacienteNome?: string;
  medicoId: number;
  medicoNome?: string;
  dataHora: string; // ISO without offset
  observacoes?: string;
  status: ConsultaStatus;
};

export type ConsultaRequest = {
  pacienteId: number;
  medicoId: number;
  dataHora: string; // ISO without offset
  observacoes?: string;
  status?: ConsultaStatus;
};

export async function listarConsultas() {
  const { data } = await http.get<Consulta[]>("/consultas");
  return data;
}

export async function criarConsulta(req: ConsultaRequest) {
  const { data } = await http.post<Consulta>("/consultas", req);
  return data;
}

export async function alterarStatus(id: number, valor: ConsultaStatus) {
  await http.patch<void>(`/consultas/${id}/status`, undefined, {
    params: { valor },
  });
}

export async function remarcar(id: number, novaDataHoraISO: string) {
  await http.patch<void>(`/consultas/${id}/data-hora`, undefined, {
    params: { valor: novaDataHoraISO },
  });
}

export async function deletarConsulta(id: number) {
  await http.delete<void>(`/consultas/${id}`);
}
