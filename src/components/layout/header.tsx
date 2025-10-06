import { Button } from "@/components/ui/button"
import { Moon, Sun, User, LogOut } from "lucide-react"
import { useState } from "react"

interface HeaderProps {
    title: string
    onThemeToggle: () => void
    isDark: boolean
}

export function Header({ title, onThemeToggle, isDark }: HeaderProps) {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onThemeToggle}
                    className="h-9 w-9"
                >
                    {isDark ? (
                        <Sun className="h-4 w-4" />
                    ) : (
                        <Moon className="h-4 w-4" />
                    )}
                </Button>

                {/* User Menu */}
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium">Dr. Admin</p>
                        <p className="text-xs text-muted-foreground">Administrador</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
