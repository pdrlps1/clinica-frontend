/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Receita, ReceitaRequest } from "../api/receitas";
import { listarReceitas, listarPorConsulta, criarReceita, atualizarReceita, deletarReceita } from "../api/receitas";

function useQuery() {
    const sp = new URLSearchParams(window.location.search);
    return Object.fromEntries(sp.entries());
}

const schema = z.object({
    consultaId: z.coerce.number().min(1, "Informe a consulta"),
    medicamento: z.string().min(1, "Informe o medicamento"),
    dosagem: z.string().optional(),
    instrucoes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ReceitasPage() {
    const [items, setItems] = useState<Receita[]>([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    const query = useQuery();
    const [consultaIdFiltro, setConsultaIdFiltro] = useState<number | "">(query.consultaId ? Number(query.consultaId) : "");

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

    async function carregar() {
        setLoading(true);
        setErro(null);
        try {
            if (consultaIdFiltro) {
                const data = await listarPorConsulta(Number(consultaIdFiltro));
                setItems(data);
            } else {
                const data = await listarReceitas();
                setItems(data);
            }
        } catch (e: any) {
            setErro(e?.message || "Falha ao carregar receitas");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { carregar(); }, []);

    function applyFilter() {
        carregar();
    }

    function startEditar(r: Receita) {
        setEditingId(r.id);
        setValue("consultaId", r.consultaId);
        setValue("medicamento", r.medicamento);
        setValue("dosagem", r.dosagem || "");
        setValue("instrucoes", r.instrucoes || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function cancelarEdicao() {
        setEditingId(null);
        reset();
    }

    async function onSubmit(values: FormValues) {
        setErro(null);
        try {
            if (editingId) {
                await atualizarReceita(editingId, values);
            } else {
                await criarReceita(values);
            }
            cancelarEdicao();
            await carregar();
        } catch (e: any) {
            setErro(e?.message || "Falha ao salvar receita");
        }
    }

    async function onDelete(id: number) {
        try {
            await deletarReceita(id);
            await carregar();
        } catch (e: any) {
            setErro(e?.message || "Falha ao excluir receita");
        }
    }

    const filtrados = useMemo(() => {
        if (!consultaIdFiltro) return items;
        return items.filter((r) => r.consultaId === Number(consultaIdFiltro));
    }, [items, consultaIdFiltro]);

    return (
        <div className="mx-auto max-w-6xl p-6 grid gap-6">
            <h1 className="text-2xl font-bold">Receitas</h1>

            <div className="border rounded p-4 grid md:grid-cols-[auto_1fr_auto] gap-3 items-end">
                <div className="grid gap-1">
                    <label>Consulta ID</label>
                    <input className="border rounded px-3 py-2" value={consultaIdFiltro} onChange={(e) => setConsultaIdFiltro(e.target.value ? Number(e.target.value) : "")} placeholder="Ex.: 123" />
                </div>
                <div>
                    <button onClick={applyFilter} className="border rounded px-4 py-2">Carregar</button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 border rounded p-4">
                <div className="flex items-center justify-between">
                    <div className="font-semibold">{editingId ? `Editar receita #${editingId}` : "Nova receita"}</div>
                    {editingId && <button type="button" onClick={cancelarEdicao} className="text-sm underline">Cancelar edição</button>}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                    <div className="grid gap-1">
                        <label>Consulta ID</label>
                        <input className="border rounded px-3 py-2" {...register("consultaId")} />
                        {errors.consultaId && <span className="text-red-600 text-sm">{errors.consultaId.message}</span>}
                    </div>
                    <div className="grid gap-1">
                        <label>Medicamento</label>
                        <input className="border rounded px-3 py-2" {...register("medicamento")} />
                        {errors.medicamento && <span className="text-red-600 text-sm">{errors.medicamento.message}</span>}
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                    <div className="grid gap-1">
                        <label>Dosagem</label>
                        <input className="border rounded px-3 py-2" {...register("dosagem")} />
                    </div>
                    <div className="grid gap-1">
                        <label>Instruções</label>
                        <input className="border rounded px-3 py-2" {...register("instrucoes")} />
                    </div>
                </div>
                <div>
                    <button disabled={isSubmitting} className="bg-black text-white rounded px-4 py-2 disabled:opacity-60">{editingId ? (isSubmitting ? "Atualizando..." : "Atualizar") : (isSubmitting ? "Salvando..." : "Salvar")}</button>
                </div>
                {erro && <div className="text-red-700">{erro}</div>}
            </form>

            <div className="border rounded">
                <div className="px-4 py-3 font-semibold border-b flex items-center justify-between">
                    <span>Lista</span>
                    <button className="text-sm underline" onClick={carregar} disabled={loading}>{loading ? "Atualizando..." : "Atualizar"}</button>
                </div>
                {loading ? (
                    <div className="p-4">Carregando...</div>
                ) : filtrados.length === 0 ? (
                    <div className="p-4">Nenhuma receita encontrada.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="[&>*]:px-4 [&>*]:py-2 border-b">
                                <th>ID</th>
                                <th>Consulta</th>
                                <th>Medicamento</th>
                                <th>Dosagem</th>
                                <th>Instruções</th>
                                <th style={{ width: 140 }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((r) => (
                                <tr key={r.id} className="[&>*]:px-4 [&>*]:py-2 border-b">
                                    <td>{r.id}</td>
                                    <td>{r.consultaId}</td>
                                    <td>{r.medicamento}</td>
                                    <td>{r.dosagem || "-"}</td>
                                    <td>{r.instrucoes || "-"}</td>
                                    <td className="flex gap-2">
                                        <button onClick={() => startEditar(r)} className="border rounded px-2 py-1 text-sm">Editar</button>
                                        <button onClick={() => onDelete(r.id)} className="border rounded px-2 py-1 text-sm">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}


