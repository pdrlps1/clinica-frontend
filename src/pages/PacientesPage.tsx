/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Paciente, PacienteRequest } from "../api/pacientes";
import {
    listarPacientes,
    criarPaciente,
    atualizarPaciente,
    deletarPaciente,
} from "../api/pacientes";

const schema = z.object({
    nome: z.string().min(1, "Informe o nome"),
    email: z.string().email("E-mail inválido"),
    telefone: z.string().optional(),
    dataNascimento: z.string().optional(), // "1995-04-10"
    endereco: z.string().optional(),
});

export default function PacientesPage() {
    const [items, setItems] = useState<Paciente[]>([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    // filtros
    const [fNome, setFNome] = useState("");
    const [fEmail, setFEmail] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<PacienteRequest>({ resolver: zodResolver(schema) });

    async function carregar() {
        setLoading(true);
        setErro(null);
        try {
            const data = await listarPacientes();
            setItems(data);
        } catch (e: any) {
            setErro(e?.response?.data?.message || "Falha ao carregar pacientes");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { carregar(); }, []);

    function startEditar(p: Paciente) {
        setEditingId(p.id);
        // preenche o form
        setValue("nome", p.nome);
        setValue("email", p.email);
        setValue("telefone", p.telefone || "");
        setValue("dataNascimento", p.dataNascimento || "");
        setValue("endereco", p.endereco || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function cancelarEdicao() {
        setEditingId(null);
        reset(); // limpa o form
    }

    async function onSubmit(values: PacienteRequest) {
        setErro(null);
        try {
            if (editingId) {
                await atualizarPaciente(editingId, values);
            } else {
                await criarPaciente(values);
            }
            cancelarEdicao();
            await carregar();
        } catch (e: any) {
            setErro(e?.response?.data?.message || "Falha ao salvar paciente");
        }
    }

    async function onDelete(id: number) {
        const ok = confirm("Confirma excluir este paciente?");
        if (!ok) return;
        setErro(null);
        try {
            await deletarPaciente(id);
            await carregar();
        } catch (e: any) {
            setErro(
                e?.response?.data?.message ||
                "Falha ao excluir (verifique se não há consultas vinculadas)"
            );
        }
    }

    // aplica filtros no client (por enquanto)
    const filtrados = useMemo(() => {
        const n = fNome.trim().toLowerCase();
        const e = fEmail.trim().toLowerCase();
        return items.filter((p) => {
            const okNome = n ? p.nome.toLowerCase().includes(n) : true;
            const okEmail = e ? p.email.toLowerCase().includes(e) : true;
            return okNome && okEmail;
        });
    }, [items, fNome, fEmail]);

    return (
        <div className="mx-auto max-w-6xl p-6 grid gap-6">
            <h1 className="text-2xl font-bold">Pacientes</h1>

            {/* Form criar/editar */}
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 border rounded p-4">
                <div className="flex items-center justify-between">
                    <div className="font-semibold">
                        {editingId ? `Editar paciente #${editingId}` : "Novo paciente"}
                    </div>
                    {editingId && (
                        <button
                            type="button"
                            onClick={cancelarEdicao}
                            className="text-sm underline"
                        >
                            Cancelar edição
                        </button>
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
                    <label>Telefone</label>
                    <input className="border rounded px-3 py-2" {...register("telefone")} />
                </div>
                <div className="grid gap-1">
                    <label>Data de nascimento</label>
                    <input type="date" className="border rounded px-3 py-2" {...register("dataNascimento")} />
                </div>
                <div className="grid gap-1">
                    <label>Endereço</label>
                    <input className="border rounded px-3 py-2" {...register("endereco")} />
                </div>

                <div className="flex gap-3 pt-1">
                    <button
                        disabled={isSubmitting}
                        className="bg-black text-white rounded px-4 py-2 disabled:opacity-60"
                    >
                        {editingId ? (isSubmitting ? "Atualizando..." : "Atualizar") : (isSubmitting ? "Salvando..." : "Salvar")}
                    </button>
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="border rounded px-4 py-2"
                    >
                        Limpar
                    </button>
                </div>

                {erro && <div className="text-red-700">{erro}</div>}
            </form>

            {/* Filtros */}
            <div className="border rounded p-4 grid gap-3">
                <div className="font-semibold">Filtros</div>
                <div className="grid md:grid-cols-2 gap-3">
                    <div className="grid gap-1">
                        <label>Nome contém</label>
                        <input
                            className="border rounded px-3 py-2"
                            value={fNome}
                            onChange={(e) => setFNome(e.target.value)}
                            placeholder="Ex.: Ana"
                        />
                    </div>
                    <div className="grid gap-1">
                        <label>E-mail contém</label>
                        <input
                            className="border rounded px-3 py-2"
                            value={fEmail}
                            onChange={(e) => setFEmail(e.target.value)}
                            placeholder="Ex.: @example.com"
                        />
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div className="border rounded">
                <div className="px-4 py-3 font-semibold border-b flex items-center justify-between">
                    <span>Lista</span>
                    <button
                        className="text-sm underline"
                        onClick={carregar}
                        disabled={loading}
                    >
                        {loading ? "Atualizando..." : "Atualizar"}
                    </button>
                </div>

                {loading ? (
                    <div className="p-4">Carregando...</div>
                ) : filtrados.length === 0 ? (
                    <div className="p-4">Nenhum paciente encontrado.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="[&>*]:px-4 [&>*]:py-2 border-b">
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Telefone</th>
                                <th>Nascimento</th>
                                <th>Endereço</th>
                                <th style={{ width: 140 }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((p) => (
                                <tr key={p.id} className="[&>*]:px-4 [&>*]:py-2 border-b">
                                    <td>{p.nome}</td>
                                    <td>{p.email}</td>
                                    <td>{p.telefone || "-"}</td>
                                    <td>{p.dataNascimento || "-"}</td>
                                    <td>{p.endereco || "-"}</td>
                                    <td className="flex gap-2">
                                        <button
                                            onClick={() => startEditar(p)}
                                            className="border rounded px-2 py-1 text-sm"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => onDelete(p.id)}
                                            className="border rounded px-2 py-1 text-sm"
                                        >
                                            Excluir
                                        </button>
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
