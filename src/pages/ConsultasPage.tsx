/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Consulta, ConsultaRequest, ConsultaStatus } from "../api/consultas";
import { listarConsultas, criarConsulta, alterarStatus, remarcar, deletarConsulta } from "../api/consultas";
import { listarPacientes, type Paciente } from "../api/pacientes";
import { listarMedicos, type Medico } from "../api/medicos";
import { toISOFromLocal, formatDateTime } from "../utils/date";
import ConfirmButton from "../components/ConfirmButton";

const schema = z.object({
    pacienteId: z.coerce.number().min(1, "Selecione um paciente"),
    medicoId: z.coerce.number().min(1, "Selecione um médico"),
    dataHora: z.string().min(1, "Informe data e hora"),
    observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ConsultasPage() {
    const [items, setItems] = useState<Consulta[]>([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [medicos, setMedicos] = useState<Medico[]>([]);
    const [remarcarId, setRemarcarId] = useState<number | null>(null);
    const [novaDataHora, setNovaDataHora] = useState("");

    // filtros
    const [fPaciente, setFPaciente] = useState("");
    const [fMedico, setFMedico] = useState("");
    const [fDe, setFDe] = useState("");
    const [fAte, setFAte] = useState("");

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

    async function carregarAuxiliares() {
        const [ps, ms] = await Promise.all([listarPacientes(), listarMedicos()]);
        setPacientes(ps);
        setMedicos(ms);
    }

    async function carregar() {
        setLoading(true);
        setErro(null);
        try {
            await carregarAuxiliares();
            const data = await listarConsultas();
            setItems(data);
        } catch (e: any) {
            setErro(e?.message || "Falha ao carregar consultas");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { carregar(); }, []);

    async function onSubmit(values: FormValues) {
        setErro(null);
        try {
            const iso = toISOFromLocal(values.dataHora);
            await criarConsulta({
                pacienteId: values.pacienteId,
                medicoId: values.medicoId,
                dataHora: iso,
                observacoes: values.observacoes || undefined,
            } satisfies ConsultaRequest);
            reset();
            await carregar();
        } catch (e: any) {
            setErro(e?.message || "Falha ao criar consulta");
        }
    }

    async function onAcaoStatus(id: number, status: ConsultaStatus) {
        setErro(null);
        try {
            await alterarStatus(id, status);
            await carregar();
        } catch (e: any) {
            setErro(e?.message || "Falha ao alterar status");
        }
    }

    async function onRemarcar() {
        if (!remarcarId || !novaDataHora) return;
        setErro(null);
        try {
            const iso = toISOFromLocal(novaDataHora);
            await remarcar(remarcarId, iso);
            setRemarcarId(null);
            setNovaDataHora("");
            await carregar();
        } catch (e: any) {
            setErro(e?.message || "Falha ao remarcar");
        }
    }

    async function onDelete(id: number) {
        try {
            await deletarConsulta(id);
            await carregar();
        } catch (e: any) {
            setErro(e?.message || "Falha ao excluir consulta");
        }
    }

    const filtrados = useMemo(() => {
        const p = fPaciente.trim().toLowerCase();
        const m = fMedico.trim().toLowerCase();
        const de = fDe ? new Date(fDe) : null;
        const ate = fAte ? new Date(fAte) : null;
        return items.filter((c) => {
            const okP = p ? (c.pacienteNome || String(c.pacienteId)).toLowerCase().includes(p) : true;
            const okM = m ? (c.medicoNome || String(c.medicoId)).toLowerCase().includes(m) : true;
            const when = new Date(c.dataHora.replace("T", " "));
            const okDe = de ? when >= de : true;
            const okAte = ate ? when <= new Date(ate.getTime() + 24 * 60 * 60 * 1000 - 1) : true;
            return okP && okM && okDe && okAte;
        });
    }, [items, fPaciente, fMedico, fDe, fAte]);

    return (
        <div className="mx-auto max-w-6xl p-6 grid gap-6">
            <h1 className="text-2xl font-bold">Consultas</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 border rounded p-4">
                <div className="font-semibold">Nova consulta</div>
                <div className="grid md:grid-cols-2 gap-3">
                    <div className="grid gap-1">
                        <label>Paciente</label>
                        <select className="border rounded px-3 py-2" {...register("pacienteId")}>
                            <option value="">Selecione</option>
                            {pacientes.map((p) => (
                                <option key={p.id} value={p.id}>{p.nome}</option>
                            ))}
                        </select>
                        {errors.pacienteId && <span className="text-red-600 text-sm">{errors.pacienteId.message}</span>}
                    </div>
                    <div className="grid gap-1">
                        <label>Médico</label>
                        <select className="border rounded px-3 py-2" {...register("medicoId")}>
                            <option value="">Selecione</option>
                            {medicos.map((m) => (
                                <option key={m.id} value={m.id}>{m.nome}</option>
                            ))}
                        </select>
                        {errors.medicoId && <span className="text-red-600 text-sm">{errors.medicoId.message}</span>}
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                    <div className="grid gap-1">
                        <label>Data e hora</label>
                        <input type="datetime-local" className="border rounded px-3 py-2" {...register("dataHora")} />
                        {errors.dataHora && <span className="text-red-600 text-sm">{errors.dataHora.message}</span>}
                    </div>
                    <div className="grid gap-1">
                        <label>Observações</label>
                        <input className="border rounded px-3 py-2" {...register("observacoes")} />
                    </div>
                </div>
                <div>
                    <button disabled={isSubmitting} className="bg-black text-white rounded px-4 py-2 disabled:opacity-60">
                        {isSubmitting ? "Salvando..." : "Salvar"}
                    </button>
                </div>
                {erro && <div className="text-red-700">{erro}</div>}
            </form>

            <div className="border rounded p-4 grid gap-3">
                <div className="font-semibold">Filtros</div>
                <div className="grid md:grid-cols-3 gap-3">
                    <div className="grid gap-1">
                        <label>Paciente</label>
                        <input className="border rounded px-3 py-2" value={fPaciente} onChange={(e) => setFPaciente(e.target.value)} />
                    </div>
                    <div className="grid gap-1">
                        <label>Médico</label>
                        <input className="border rounded px-3 py-2" value={fMedico} onChange={(e) => setFMedico(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1">
                            <label>Data de</label>
                            <input type="date" className="border rounded px-3 py-2" value={fDe} onChange={(e) => setFDe(e.target.value)} />
                        </div>
                        <div className="grid gap-1">
                            <label>até</label>
                            <input type="date" className="border rounded px-3 py-2" value={fAte} onChange={(e) => setFAte(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="border rounded">
                <div className="px-4 py-3 font-semibold border-b flex items-center justify-between">
                    <span>Lista</span>
                    <button className="text-sm underline" onClick={carregar} disabled={loading}>{loading ? "Atualizando..." : "Atualizar"}</button>
                </div>
                {loading ? (
                    <div className="p-4">Carregando...</div>
                ) : filtrados.length === 0 ? (
                    <div className="p-4">Nenhuma consulta encontrada.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="[&>*]:px-4 [&>*]:py-2 border-b">
                                <th>Paciente</th>
                                <th>Médico</th>
                                <th>Data/Hora</th>
                                <th>Status</th>
                                <th>Observações</th>
                                <th style={{ width: 280 }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((c) => (
                                <tr key={c.id} className="[&>*]:px-4 [&>*]:py-2 border-b">
                                    <td>{c.pacienteNome || c.pacienteId}</td>
                                    <td>{c.medicoNome || c.medicoId}</td>
                                    <td>{formatDateTime(c.dataHora)}</td>
                                    <td>{c.status}</td>
                                    <td>{c.observacoes || "-"}</td>
                                    <td className="flex flex-wrap gap-2">
                                        <button onClick={() => onAcaoStatus(c.id, "CANCELADA")} className="border rounded px-2 py-1 text-sm">Cancelar</button>
                                        <button onClick={() => onAcaoStatus(c.id, "CONCLUIDA")} className="border rounded px-2 py-1 text-sm">Concluir</button>
                                        {remarcarId === c.id ? (
                                            <div className="flex items-center gap-2">
                                                <input type="datetime-local" className="border rounded px-2 py-1 text-sm" value={novaDataHora} onChange={(e) => setNovaDataHora(e.target.value)} />
                                                <button onClick={onRemarcar} className="border rounded px-2 py-1 text-sm">OK</button>
                                                <button onClick={() => { setRemarcarId(null); setNovaDataHora(""); }} className="border rounded px-2 py-1 text-sm">Cancelar</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setRemarcarId(c.id)} className="border rounded px-2 py-1 text-sm">Remarcar</button>
                                        )}
                                        <ConfirmButton className="border rounded px-2 py-1 text-sm" message="Confirma excluir esta consulta?" onConfirm={() => onDelete(c.id)}>Excluir</ConfirmButton>
                                        <a className="border rounded px-2 py-1 text-sm" href={`/receitas?consultaId=${c.id}`}>Receitas</a>
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


