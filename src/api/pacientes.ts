import { http } from "./http";

export type Paciente = {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  dataNascimento?: string;
  endereco?: string;
};

export type PacienteRequest = Omit<Paciente, "id">;

export async function listarPacientes() {
  const { data } = await http.get<Paciente[]>("/pacientes");

  return data;
}

export async function criarPaciente(req: PacienteRequest) {
  const { data } = await http.post<Paciente>("/pacientes", req);

  return data;
}

export async function atualizarPaciente(id: number, req: PacienteRequest) {
  const { data } = await http.put<Paciente>(`/pacientes/${id}`, req);

  return data;
}

export async function deletarPaciente(id: number) {
  await http.delete<void>(`/pacientes/${id}`);
}
