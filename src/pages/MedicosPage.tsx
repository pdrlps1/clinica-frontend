/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, RefreshCw, Stethoscope } from "lucide-react";
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Médicos</h2>
                    <p className="text-muted-foreground">
                        Gerencie os médicos da clínica
                    </p>
                </div>
                <Button onClick={carregar} disabled={loading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>

            {/* Form criar/editar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5" />
                        {editingId ? `Editar médico #${editingId}` : "Novo médico"}
                    </CardTitle>
                    <CardDescription>
                        {editingId ? "Atualize as informações do médico" : "Cadastre um novo médico no sistema"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome *</Label>
                                <Input
                                    id="nome"
                                    {...register("nome")}
                                    placeholder="Nome completo"
                                />
                                {errors.nome && (
                                    <p className="text-sm text-destructive">{errors.nome.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="email@exemplo.com"
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="crm">CRM *</Label>
                                <Input
                                    id="crm"
                                    {...register("crm")}
                                    placeholder="123456"
                                />
                                {errors.crm && (
                                    <p className="text-sm text-destructive">{errors.crm.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="especialidade">Especialidade</Label>
                                <Input
                                    id="especialidade"
                                    {...register("especialidade")}
                                    placeholder="Ex.: Cardiologia"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input
                                id="telefone"
                                {...register("telefone")}
                                placeholder="(11) 99999-9999"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={isSubmitting}>
                                {editingId ? (isSubmitting ? "Atualizando..." : "Atualizar") : (isSubmitting ? "Salvando..." : "Salvar")}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => reset()}>
                                Limpar
                            </Button>
                            {editingId && (
                                <Button type="button" variant="ghost" onClick={cancelarEdicao}>
                                    Cancelar edição
                                </Button>
                            )}
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
                        Filtre os médicos por nome, e-mail ou CRM
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="filtro-nome">Nome</Label>
                            <Input
                                id="filtro-nome"
                                value={fNome}
                                onChange={(e) => setFNome(e.target.value)}
                                placeholder="Ex.: Dr. João"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="filtro-email">E-mail</Label>
                            <Input
                                id="filtro-email"
                                value={fEmail}
                                onChange={(e) => setFEmail(e.target.value)}
                                placeholder="Ex.: @exemplo.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="filtro-crm">CRM</Label>
                            <Input
                                id="filtro-crm"
                                value={fCRM}
                                onChange={(e) => setFCRM(e.target.value)}
                                placeholder="Ex.: 123456"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Médicos</CardTitle>
                    <CardDescription>
                        {filtrados.length} médico(s) encontrado(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Carregando...</div>
                        </div>
                    ) : filtrados.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Nenhum médico encontrado.</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Nome</th>
                                        <th className="text-left p-4 font-medium">E-mail</th>
                                        <th className="text-left p-4 font-medium">CRM</th>
                                        <th className="text-left p-4 font-medium">Especialidade</th>
                                        <th className="text-left p-4 font-medium">Telefone</th>
                                        <th className="text-left p-4 font-medium w-32">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtrados.map((m) => (
                                        <tr key={m.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-medium">{m.nome}</td>
                                            <td className="p-4 text-muted-foreground">{m.email}</td>
                                            <td className="p-4 text-muted-foreground">{m.crm}</td>
                                            <td className="p-4 text-muted-foreground">{m.especialidade || "-"}</td>
                                            <td className="p-4 text-muted-foreground">{m.telefone || "-"}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => startEditar(m)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <ConfirmButton
                                                        size="sm"
                                                        variant="destructive"
                                                        message="Confirma excluir este médico?"
                                                        onConfirm={() => onDelete(m.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </ConfirmButton>
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


