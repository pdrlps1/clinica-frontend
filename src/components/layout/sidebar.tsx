import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Calendar,
    FileText,
    Menu,
    X,
} from "lucide-react"

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Pacientes", href: "/pacientes", icon: Users },
    { name: "Médicos", href: "/medicos", icon: Stethoscope },
    { name: "Consultas", href: "/consultas", icon: Calendar },
    { name: "Receitas", href: "/receitas", icon: FileText },
]

interface SidebarProps {
    collapsed: boolean
    onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const location = useLocation()

    return (
        <div
            className={cn(
                "flex h-full flex-col bg-card border-r transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b">
                {!collapsed && (
                    <h1 className="text-lg font-semibold text-foreground">
                        Clínica Médica
                    </h1>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="h-8 w-8"
                >
                    {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
