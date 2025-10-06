/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Search, RefreshCw, X, CheckCircle, Clock, Trash2, FileText } from "lucide-react";
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Consultas</h2>
                    <p className="text-muted-foreground">
                        Gerencie a agenda de consultas
                    </p>
                </div>
                <Button onClick={carregar} disabled={loading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>

            {/* Form criar consulta */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Nova consulta
                    </CardTitle>
                    <CardDescription>
                        Agende uma nova consulta médica
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pacienteId">Paciente *</Label>
                                <select
                                    id="pacienteId"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...register("pacienteId")}
                                >
                                    <option value="">Selecione um paciente</option>
                                    {pacientes.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nome}</option>
                                    ))}
                                </select>
                                {errors.pacienteId && (
                                    <p className="text-sm text-destructive">{errors.pacienteId.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="medicoId">Médico *</Label>
                                <select
                                    id="medicoId"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...register("medicoId")}
                                >
                                    <option value="">Selecione um médico</option>
                                    {medicos.map((m) => (
                                        <option key={m.id} value={m.id}>{m.nome}</option>
                                    ))}
                                </select>
                                {errors.medicoId && (
                                    <p className="text-sm text-destructive">{errors.medicoId.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dataHora">Data e hora *</Label>
                                <Input
                                    id="dataHora"
                                    type="datetime-local"
                                    {...register("dataHora")}
                                />
                                {errors.dataHora && (
                                    <p className="text-sm text-destructive">{errors.dataHora.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="observacoes">Observações</Label>
                                <Input
                                    id="observacoes"
                                    {...register("observacoes")}
                                    placeholder="Observações da consulta"
                                />
                            </div>
                        </div>

                        <div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>

                        {erro && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                                {erro}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Filtros
                    </CardTitle>
                    <CardDescription>
                        Filtre as consultas por paciente, médico ou período
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="filtro-paciente">Paciente</Label>
                            <Input
                                id="filtro-paciente"
                                value={fPaciente}
                                onChange={(e) => setFPaciente(e.target.value)}
                                placeholder="Nome do paciente"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="filtro-medico">Médico</Label>
                            <Input
                                id="filtro-medico"
                                value={fMedico}
                                onChange={(e) => setFMedico(e.target.value)}
                                placeholder="Nome do médico"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label htmlFor="filtro-de">Data de</Label>
                                <Input
                                    id="filtro-de"
                                    type="date"
                                    value={fDe}
                                    onChange={(e) => setFDe(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="filtro-ate">até</Label>
                                <Input
                                    id="filtro-ate"
                                    type="date"
                                    value={fAte}
                                    onChange={(e) => setFAte(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Consultas</CardTitle>
                    <CardDescription>
                        {filtrados.length} consulta(s) encontrada(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Carregando...</div>
                        </div>
                    ) : filtrados.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Nenhuma consulta encontrada.</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Paciente</th>
                                        <th className="text-left p-4 font-medium">Médico</th>
                                        <th className="text-left p-4 font-medium">Data/Hora</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Observações</th>
                                        <th className="text-left p-4 font-medium w-80">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtrados.map((c) => (
                                        <tr key={c.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-medium">{c.pacienteNome || c.pacienteId}</td>
                                            <td className="p-4 text-muted-foreground">{c.medicoNome || c.medicoId}</td>
                                            <td className="p-4 text-muted-foreground">{formatDateTime(c.dataHora)}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'AGENDADA' ? 'bg-blue-100 text-blue-800' :
                                                    c.status === 'CONCLUIDA' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-muted-foreground">{c.observacoes || "-"}</td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onAcaoStatus(c.id, "CANCELADA")}
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onAcaoStatus(c.id, "CONCLUIDA")}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Concluir
                                                    </Button>
                                                    {remarcarId === c.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="datetime-local"
                                                                size="sm"
                                                                value={novaDataHora}
                                                                onChange={(e) => setNovaDataHora(e.target.value)}
                                                                className="w-48"
                                                            />
                                                            <Button size="sm" onClick={onRemarcar}>
                                                                <Clock className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => { setRemarcarId(null); setNovaDataHora(""); }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setRemarcarId(c.id)}
                                                        >
                                                            <Clock className="h-4 w-4 mr-1" />
                                                            Remarcar
                                                        </Button>
                                                    )}
                                                    <ConfirmButton
                                                        size="sm"
                                                        variant="destructive"
                                                        message="Confirma excluir esta consulta?"
                                                        onConfirm={() => onDelete(c.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </ConfirmButton>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => window.open(`/receitas?consultaId=${c.id}`, '_blank')}
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Receitas
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


