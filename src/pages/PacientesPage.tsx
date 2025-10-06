/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, RefreshCw } from "lucide-react";
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
                    <p className="text-muted-foreground">
                        Gerencie os pacientes da clínica
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
                        <Plus className="h-5 w-5" />
                        {editingId ? `Editar paciente #${editingId}` : "Novo paciente"}
                    </CardTitle>
                    <CardDescription>
                        {editingId ? "Atualize as informações do paciente" : "Cadastre um novo paciente no sistema"}
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
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input
                                    id="telefone"
                                    {...register("telefone")}
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dataNascimento">Data de nascimento</Label>
                                <Input
                                    id="dataNascimento"
                                    type="date"
                                    {...register("dataNascimento")}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endereco">Endereço</Label>
                            <Input
                                id="endereco"
                                {...register("endereco")}
                                placeholder="Endereço completo"
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
                        Filtre os pacientes por nome ou e-mail
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="filtro-nome">Nome contém</Label>
                            <Input
                                id="filtro-nome"
                                value={fNome}
                                onChange={(e) => setFNome(e.target.value)}
                                placeholder="Ex.: Ana"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="filtro-email">E-mail contém</Label>
                            <Input
                                id="filtro-email"
                                value={fEmail}
                                onChange={(e) => setFEmail(e.target.value)}
                                placeholder="Ex.: @example.com"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Pacientes</CardTitle>
                    <CardDescription>
                        {filtrados.length} paciente(s) encontrado(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Carregando...</div>
                        </div>
                    ) : filtrados.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Nenhum paciente encontrado.</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Nome</th>
                                        <th className="text-left p-4 font-medium">E-mail</th>
                                        <th className="text-left p-4 font-medium">Telefone</th>
                                        <th className="text-left p-4 font-medium">Nascimento</th>
                                        <th className="text-left p-4 font-medium">Endereço</th>
                                        <th className="text-left p-4 font-medium w-32">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtrados.map((p) => (
                                        <tr key={p.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-medium">{p.nome}</td>
                                            <td className="p-4 text-muted-foreground">{p.email}</td>
                                            <td className="p-4 text-muted-foreground">{p.telefone || "-"}</td>
                                            <td className="p-4 text-muted-foreground">{p.dataNascimento || "-"}</td>
                                            <td className="p-4 text-muted-foreground">{p.endereco || "-"}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => startEditar(p)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => onDelete(p.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
