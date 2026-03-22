import { useState, useEffect } from "react"
import { api } from "../context/AuthContext"
import { Button } from "./ui/button"
import { X } from "lucide-react"

export default function PreferencesModal({ isOpen, onClose, onSave }) {
    const [genres, setGenres] = useState([])
    const [selectedGenres, setSelectedGenres] = useState([])
    const [loading, setLoading] = useState(true)

    const languages = ["English", "Spanish", "French", "Japanese", "Korean", "Hindi"]
    const [selectedLanguages, setSelectedLanguages] = useState(["English"])

    useEffect(() => {
        if (isOpen) {
            const fetchGenres = async () => {
                try {
                    const res = await api.get("/genres")
                    setGenres(res.data)
                } catch (error) {
                    console.error("Failed to fetch genres")
                } finally {
                    setLoading(false)
                }
            }
            fetchGenres()
        }
    }, [isOpen])

    const toggleGenre = (id) => {
        setSelectedGenres(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        )
    }

    const toggleLanguage = (lang) => {
        setSelectedLanguages(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        )
    }

    const handleSave = async () => {
        try {
            await api.put("/auth/preferences", {
                genres: selectedGenres,
                languages: selectedLanguages
            })
            onSave()
            onClose()
        } catch (error) {
            alert("Failed to save preferences")
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-xl bg-zinc-900 p-8 shadow-2xl ring-1 ring-white/10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white">Customize Your Feed</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Genres */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Favorite Genres</h3>
                        <div className="flex flex-wrap gap-3">
                            {genres.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => toggleGenre(g.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedGenres.includes(g.id)
                                            ? "bg-primary text-white scale-105 shadow-lg shadow-primary/20"
                                            : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                                        }`}
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Languages */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Preferred Languages</h3>
                        <div className="flex flex-wrap gap-3">
                            {languages.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => toggleLanguage(lang)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedLanguages.includes(lang)
                                            ? "bg-primary text-white scale-105 shadow-lg shadow-primary/20"
                                            : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex gap-4">
                    <Button
                        onClick={handleSave}
                        className="flex-1 bg-primary hover:bg-red-700 h-12 text-lg font-bold"
                    >
                        Save & Explore
                    </Button>
                </div>
            </div>
        </div>
    )
}
