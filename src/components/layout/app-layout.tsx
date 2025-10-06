import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/pacientes": "Pacientes",
    "/medicos": "Médicos",
    "/consultas": "Consultas",
    "/receitas": "Receitas",
}

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [isDark, setIsDark] = useState(false)
    const location = useLocation()

    // Load theme preference from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme")
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)

        setIsDark(shouldBeDark)
        if (shouldBeDark) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = !isDark
        setIsDark(newTheme)
        localStorage.setItem("theme", newTheme ? "dark" : "light")

        if (newTheme) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }

    const currentTitle = pageTitles[location.pathname] || "Página não encontrada"

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <Header
                    title={currentTitle}
                    onThemeToggle={toggleTheme}
                    isDark={isDark}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
