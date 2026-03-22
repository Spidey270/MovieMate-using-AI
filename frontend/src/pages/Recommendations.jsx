import { useState, useEffect } from "react"
import { api, useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import MovieCard from "../components/MovieCard"
import LoadingSpinner from "../components/ui/LoadingSpinner"

export default function Recommendations() {
    const { user } = useAuth()
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const res = await api.get("/recommendations")
                setRecommendations(res.data)
            } catch (err) {
                console.error("Failed to fetch recommendations", err)
            } finally {
                setLoading(false)
            }
        }
        if (user) {
            fetchRecs()
        } else {
            setLoading(false)
        }
    }, [user])

    if (loading) return <LoadingSpinner />

    return (
        <div className="min-h-screen bg-secondary pb-20">
            <Navbar />
            <div className="pt-24 mx-auto max-w-7xl px-4">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-gray-800 pb-4 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles text-primary"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                    Your Personalized AI Recommendations
                </h1>

                {recommendations.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {recommendations.map(movie => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border border-dashed border-gray-800 rounded-xl bg-zinc-900/30">
                        <p className="text-gray-400 font-medium mb-1">No recommendations found</p>
                        <p className="text-sm text-gray-500">Add movies to your wishlist or leave reviews to improve your profile.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
