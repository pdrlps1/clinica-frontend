/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Medico, MedicoRequest } from "../api/medicos";
import { listarMedicos, criarMedico, atualizarMedico, deletarMedico } from "../api/medicos";
import ConfirmButton from "../components/ConfirmButton";

const schema = z.object({
    nome: z.string().min(1, "Informe o nome"),
    email: z.string().email("E-mail inválido"),
    crm: z.string().min(1, "Informe o CRM"),
    especialidade: z.string().optional(),
    telefone: z.string().optional(),
});

export default function MedicosPage() {
    const [items, setItems] = useState<Medico[]>([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    // filtros
    const [fNome, setFNome] = useState("");
    const [fEmail, setFEmail] = useState("");
    const [fCRM, setFCRM] = useState("");

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<MedicoRequest>({ resolver: zodResolver(schema) });

    async function carregar() {
        setLoading(true);
        setErro(null);
        try {
            const data = await listarMedicos();
            setItems(data);
        } catch (e: any) {
            setErro(e?.message || "Falha ao carregar médicos");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { carregar(); }, []);

    function startEditar(m: Medico) {
        setEditingId(m.id);
        setValue("nome", m.nome);
        setValue("email", m.email);
        setValue("crm", m.crm);
        setValue("especialidade", m.especialidade || "");
        setValue("telefone", m.telefone || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function cancelarEdicao() {
        setEditingId(null);
        reset();
    }

    async function onSubmit(values: MedicoRequest) {
        setErro(null);
        try {
            if (editingId) {
                await atualizarMedico(editingId, values);
            } else {
                await criarMedico(values);
            }
            cancelarEdicao();
            await carregar();
        } catch (e: any) {
            setErro(e?.message || "Falha ao salvar médico");
        }
    }

    async function onDelete(id: number) {
        try {
            await deletarMedico(id);
            await carregar();
        } catch (e: any) {
            setErro(e?.message || "Falha ao excluir médico");
        }
    }

    const filtrados = useMemo(() => {
        const n = fNome.trim().toLowerCase();
        const e = fEmail.trim().toLowerCase();
        const c = fCRM.trim().toLowerCase();
        return items.filter((m) => {
            const okNome = n ? m.nome.toLowerCase().includes(n) : true;
            const okEmail = e ? m.email.toLowerCase().includes(e) : true;
            const okCRM = c ? m.crm.toLowerCase().includes(c) : true;
            return okNome && okEmail && okCRM;
        });
    }, [items, fNome, fEmail, fCRM]);

    return (
        <div className="mx-auto max-w-6xl p-6 grid gap-6">
            <h1 className="text-2xl font-bold">Médicos</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 border rounded p-4">
                <div className="flex items-center justify-between">
                    <div className="font-semibold">{editingId ? `Editar médico #${editingId}` : "Novo médico"}</div>
                    {editingId && (
                        <button type="button" onClick={cancelarEdicao} className="text-sm underline">Cancelar edição</button>
                    )}
                </div>

                <div className="grid gap-1">
                    <label>Nome</label>
                    <input className="border rounded px-3 py-2" {...register("nome")} />
                    {errors.nome && <span className="text-red-600 text-sm">{errors.nome.message}</span>}
                </div>
                <div className="grid gap-1">
                    <label>E-mail</label>
                    <input className="border rounded px-3 py-2" {...register("email")} />
                    {errors.email && <span className="text-red-600 text-sm">{errors.email.message}</span>}
                </div>
                <div className="grid gap-1">
                    <label>CRM</label>
                    <input className="border rounded px-3 py-2" {...register("crm")} />
                    {errors.crm && <span className="text-red-600 text-sm">{errors.crm.message}</span>}
                </div>
                <div className="grid gap-1">
                    <label>Especialidade</label>
                    <input className="border rounded px-3 py-2" {...register("especialidade")} />
                </div>
                <div className="grid gap-1">
                    <label>Telefone</label>
                    <input className="border rounded px-3 py-2" {...register("telefone")} />
                </div>

                <div className="flex gap-3 pt-1">
                    <button disabled={isSubmitting} className="bg-black text-white rounded px-4 py-2 disabled:opacity-60">
                        {editingId ? (isSubmitting ? "Atualizando..." : "Atualizar") : (isSubmitting ? "Salvando..." : "Salvar")}
                    </button>
                    <button type="button" onClick={() => reset()} className="border rounded px-4 py-2">Limpar</button>
                </div>

                {erro && <div className="text-red-700">{erro}</div>}
            </form>

            <div className="border rounded p-4 grid gap-3">
                <div className="font-semibold">Filtros</div>
                <div className="grid md:grid-cols-3 gap-3">
                    <div className="grid gap-1">
                        <label>Nome</label>
                        <input className="border rounded px-3 py-2" value={fNome} onChange={(e) => setFNome(e.target.value)} />
                    </div>
                    <div className="grid gap-1">
                        <label>E-mail</label>
                        <input className="border rounded px-3 py-2" value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-1">
                        <label>CRM</label>
                        <input className="border rounded px-3 py-2" value={fCRM} onChange={(e) => setFCRM(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="border rounded">
                <div className="px-4 py-3 font-semibold border-b flex items-center justify-between">
                    <span>Lista</span>
                    <button className="text-sm underline" onClick={carregar} disabled={loading}>
                        {loading ? "Atualizando..." : "Atualizar"}
                    </button>
                </div>
                {loading ? (
                    <div className="p-4">Carregando...</div>
                ) : filtrados.length === 0 ? (
                    <div className="p-4">Nenhum médico encontrado.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="[&>*]:px-4 [&>*]:py-2 border-b">
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>CRM</th>
                                <th>Especialidade</th>
                                <th>Telefone</th>
                                <th style={{ width: 140 }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((m) => (
                                <tr key={m.id} className="[&>*]:px-4 [&>*]:py-2 border-b">
                                    <td>{m.nome}</td>
                                    <td>{m.email}</td>
                                    <td>{m.crm}</td>
                                    <td>{m.especialidade || "-"}</td>
                                    <td>{m.telefone || "-"}</td>
                                    <td className="flex gap-2">
                                        <button onClick={() => startEditar(m)} className="border rounded px-2 py-1 text-sm">Editar</button>
                                        <ConfirmButton className="border rounded px-2 py-1 text-sm" message="Confirma excluir este médico?" onConfirm={() => onDelete(m.id)}>
                                            Excluir
                                        </ConfirmButton>
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


