import { http } from "./http";

export type Receita = {
  id: number;
  consultaId: number;
  medicamento: string;
  dosagem?: string;
  instrucoes?: string;
};

export type ReceitaRequest = Omit<Receita, "id">;

export async function listarReceitas() {
  const { data } = await http.get<Receita[]>("/receitas");
  return data;
}

export async function listarPorConsulta(consultaId: number) {
  const { data } = await http.get<Receita[]>(
    `/consultas/${consultaId}/receitas`
  );
  return data;
}

export async function criarReceita(req: ReceitaRequest) {
  const { data } = await http.post<Receita>("/receitas", req);
  return data;
}

export async function atualizarReceita(id: number, req: ReceitaRequest) {
  const { data } = await http.put<Receita>(`/receitas/${id}`, req);
  return data;
}

export async function deletarReceita(id: number) {
  await http.delete<void>(`/receitas/${id}`);
}
