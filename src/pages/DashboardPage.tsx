import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Stethoscope, Calendar, FileText, Clock, CheckCircle } from "lucide-react"
import { listarPacientes } from "@/api/pacientes"
import { listarMedicos } from "@/api/medicos"
import { listarConsultas } from "@/api/consultas"
import { listarReceitas } from "@/api/receitas"
import type { Paciente } from "@/api/pacientes"
import type { Medico } from "@/api/medicos"
import type { Consulta } from "@/api/consultas"
import type { Receita } from "@/api/receitas"

export default function DashboardPage() {
    const [pacientes, setPacientes] = useState<Paciente[]>([])
    const [medicos, setMedicos] = useState<Medico[]>([])
    const [consultas, setConsultas] = useState<Consulta[]>([])
    const [receitas, setReceitas] = useState<Receita[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function carregarDados() {
            try {
                const [pacientesData, medicosData, consultasData, receitasData] = await Promise.all([
                    listarPacientes(),
                    listarMedicos(),
                    listarConsultas(),
                    listarReceitas(),
                ])

                setPacientes(pacientesData)
                setMedicos(medicosData)
                setConsultas(consultasData)
                setReceitas(receitasData)
            } catch (error) {
                console.error("Erro ao carregar dados:", error)
            } finally {
                setLoading(false)
            }
        }

        carregarDados()
    }, [])

    const consultasAgendadas = consultas.filter(c => c.status === "AGENDADA").length
    const consultasConcluidas = consultas.filter(c => c.status === "CONCLUIDA").length
    const consultasHoje = consultas.filter(c => {
        const hoje = new Date().toISOString().split('T')[0]
        return c.dataHora.startsWith(hoje)
    }).length

    const stats = [
        {
            title: "Total de Pacientes",
            value: pacientes.length,
            icon: Users,
            description: "Pacientes cadastrados",
        },
        {
            title: "Total de Médicos",
            value: medicos.length,
            icon: Stethoscope,
            description: "Médicos cadastrados",
        },
        {
            title: "Consultas Agendadas",
            value: consultasAgendadas,
            icon: Calendar,
            description: "Próximas consultas",
        },
        {
            title: "Consultas Hoje",
            value: consultasHoje,
            icon: Clock,
            description: "Consultas de hoje",
        },
        {
            title: "Consultas Concluídas",
            value: consultasConcluidas,
            icon: CheckCircle,
            description: "Consultas finalizadas",
        },
        {
            title: "Total de Receitas",
            value: receitas.length,
            icon: FileText,
            description: "Receitas emitidas",
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Carregando dados...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Visão geral do sistema de gestão médica
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Consultas Recentes</CardTitle>
                        <CardDescription>
                            Últimas consultas agendadas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {consultas.slice(0, 5).map((consulta) => (
                                <div key={consulta.id} className="flex items-center space-x-4">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {consulta.pacienteNome || `Paciente #${consulta.pacienteId}`}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {consulta.medicoNome || `Médico #${consulta.medicoId}`}
                                        </p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(consulta.dataHora).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Receitas Recentes</CardTitle>
                        <CardDescription>
                            Últimas receitas emitidas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {receitas.slice(0, 5).map((receita) => (
                                <div key={receita.id} className="flex items-center space-x-4">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {receita.medicamento}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Consulta #{receita.consultaId}
                                        </p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {receita.dosagem || "Sem dosagem"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
