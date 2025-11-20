"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700"
        >
            <AnimateIcon isDark={theme === "dark"} />
        </button>
    )
}

function AnimateIcon({ isDark }: { isDark: boolean }) {
    return (
        <div className="relative w-5 h-5">
            <motion.div
                initial={false}
                animate={{ scale: isDark ? 1 : 0, rotate: isDark ? 0 : 90 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <Moon className="w-5 h-5 text-zinc-100" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{ scale: isDark ? 0 : 1, rotate: isDark ? -90 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <Sun className="w-5 h-5 text-orange-500" />
            </motion.div>
        </div>
    )
}
