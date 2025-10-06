/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Plus, Search, RefreshCw, Edit, Trash2 } from "lucide-react";
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Receitas</h2>
                    <p className="text-muted-foreground">
                        Gerencie as receitas médicas
                    </p>
                </div>
                <Button onClick={carregar} disabled={loading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>

            {/* Filtro por consulta */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Filtrar por Consulta
                    </CardTitle>
                    <CardDescription>
                        Carregue receitas de uma consulta específica
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="consulta-id">Consulta ID</Label>
                            <Input
                                id="consulta-id"
                                type="number"
                                value={consultaIdFiltro}
                                onChange={(e) => setConsultaIdFiltro(e.target.value ? Number(e.target.value) : "")}
                                placeholder="Ex.: 123"
                            />
                        </div>
                        <Button onClick={applyFilter}>
                            Carregar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Form criar/editar receita */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        {editingId ? `Editar receita #${editingId}` : "Nova receita"}
                    </CardTitle>
                    <CardDescription>
                        {editingId ? "Atualize as informações da receita" : "Cadastre uma nova receita médica"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="consultaId">Consulta ID *</Label>
                                <Input
                                    id="consultaId"
                                    type="number"
                                    {...register("consultaId")}
                                    placeholder="ID da consulta"
                                />
                                {errors.consultaId && (
                                    <p className="text-sm text-destructive">{errors.consultaId.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="medicamento">Medicamento *</Label>
                                <Input
                                    id="medicamento"
                                    {...register("medicamento")}
                                    placeholder="Nome do medicamento"
                                />
                                {errors.medicamento && (
                                    <p className="text-sm text-destructive">{errors.medicamento.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dosagem">Dosagem</Label>
                                <Input
                                    id="dosagem"
                                    {...register("dosagem")}
                                    placeholder="Ex.: 500mg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instrucoes">Instruções</Label>
                                <Input
                                    id="instrucoes"
                                    {...register("instrucoes")}
                                    placeholder="Ex.: Tomar 3x ao dia"
                                />
                            </div>
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

            {/* Tabela */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Receitas</CardTitle>
                    <CardDescription>
                        {filtrados.length} receita(s) encontrada(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Carregando...</div>
                        </div>
                    ) : filtrados.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Nenhuma receita encontrada.</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">ID</th>
                                        <th className="text-left p-4 font-medium">Consulta</th>
                                        <th className="text-left p-4 font-medium">Medicamento</th>
                                        <th className="text-left p-4 font-medium">Dosagem</th>
                                        <th className="text-left p-4 font-medium">Instruções</th>
                                        <th className="text-left p-4 font-medium w-32">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtrados.map((r) => (
                                        <tr key={r.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-medium">{r.id}</td>
                                            <td className="p-4 text-muted-foreground">{r.consultaId}</td>
                                            <td className="p-4 font-medium">{r.medicamento}</td>
                                            <td className="p-4 text-muted-foreground">{r.dosagem || "-"}</td>
                                            <td className="p-4 text-muted-foreground">{r.instrucoes || "-"}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => startEditar(r)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => onDelete(r.id)}
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


