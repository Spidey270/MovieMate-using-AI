import { useState, useEffect } from "react"
import { api } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import MovieCard from "../components/MovieCard"
import LoadingSpinner from "../components/ui/LoadingSpinner"

export default function Movies() {
    const [movies, setMovies] = useState([])
    const [genres, setGenres] = useState([])
    const [loading, setLoading] = useState(true)

    // Filter & Sort State
    const [selectedGenre, setSelectedGenre] = useState("")
    const [selectedLanguage, setSelectedLanguage] = useState("")
    const [sortBy, setSortBy] = useState("")
    const [sortOrder, setSortOrder] = useState("desc")

    const languages = [
        "English", "Spanish", "French", "German",
        "Korean", "Japanese", "Hindi", "Italian"
    ]

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await api.get("/genres")
                setGenres(res.data)
            } catch (error) {
                console.error("Failed to fetch genres", error)
            }
        }
        fetchGenres()
    }, [])

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (selectedGenre) params.append("genre", selectedGenre)
                if (selectedLanguage) params.append("language", selectedLanguage)
                if (sortBy) {
                    params.append("sort_by", sortBy)
                    params.append("order", sortOrder)
                }

                const res = await api.get(`/movies?${params.toString()}`)
                setMovies(res.data)
            } catch (error) {
                console.error("Failed to fetch movies", error)
            } finally {
                setLoading(false)
            }
        }
        fetchMovies()
    }, [selectedGenre, selectedLanguage, sortBy, sortOrder])

    return (
        <div className="min-h-screen bg-secondary pb-20">
            <Navbar />

            <div className="pt-24 mx-auto max-w-7xl px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800 pb-4">
                    <h1 className="text-3xl font-bold text-white">All Movies</h1>

                    {/* Filters & Sort Toolbar */}
                    <div className="flex flex-wrap gap-3">
                        <select
                            className="bg-zinc-900 border border-white/10 text-white text-sm rounded-lg p-2 focus:ring-primary focus:border-primary outline-none"
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                        >
                            <option value="">All Genres</option>
                            {genres.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>

                        <select
                            className="bg-zinc-900 border border-white/10 text-white text-sm rounded-lg p-2 focus:ring-primary focus:border-primary outline-none"
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                            <option value="">All Languages</option>
                            {languages.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>

                        <select
                            className="bg-zinc-900 border border-white/10 text-white text-sm rounded-lg p-2 focus:ring-primary focus:border-primary outline-none"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="">Sort By (Default)</option>
                            <option value="imdb_rating">Highest Rated</option>
                            <option value="release_date">Release Date</option>
                            <option value="title">Title (A-Z)</option>
                        </select>

                        {sortBy && (
                            <select
                                className="bg-zinc-900 border border-white/10 text-white text-sm rounded-lg p-2 focus:ring-primary focus:border-primary outline-none"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </select>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="min-h-[400px] flex items-center justify-center">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {movies.map(movie => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                        {movies.length === 0 && (
                            <div className="col-span-full py-20 text-center border border-dashed border-gray-800 rounded-xl bg-zinc-900/30">
                                <p className="text-gray-400 font-medium mb-1">No movies found matching your criteria</p>
                                <p className="text-sm text-gray-500">Try adjusting your filters or search terms.</p>
                                <button
                                    onClick={() => {
                                        setSelectedGenre("")
                                        setSelectedLanguage("")
                                        setSortBy("")
                                    }}
                                    className="mt-4 text-primary text-sm hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
