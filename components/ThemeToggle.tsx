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
            className="relative p-2 bg-[#E7E7E7] dark:bg-[#2a2a2a] hover:bg-[#00D166] dark:hover:bg-[#00D166] transition-colors border-2 border-[#1c1c1c] dark:border-[#3a3a3a] hover:border-[#00D166] group"
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
                <Moon className="w-5 h-5 text-white group-hover:text-[#1c1c1c]" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{ scale: isDark ? 0 : 1, rotate: isDark ? -90 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <Sun className="w-5 h-5 text-[#1c1c1c] group-hover:text-[#1c1c1c]" />
            </motion.div>
        </div>
    )
}
