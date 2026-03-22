import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Link, useNavigate } from "react-router-dom"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        try {
            await login(email, password)
            navigate("/")
        } catch (err) {
            setError("Invalid email or password")
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 w-full max-w-md rounded-lg bg-black/75 p-8 sm:p-12">
                <h1 className="mb-8 text-3xl font-bold">Sign In</h1>
                {error && <div className="mb-4 text-red-500">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-[#333] border-none"
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-[#333] border-none"
                    />
                    <Button type="submit" className="w-full font-bold">
                        Sign In
                    </Button>
                </form>
                <div className="mt-4 text-gray-400">
                    New to MovieMate?{" "}
                    <Link to="/register" className="text-white hover:underline">
                        Sign up now
                    </Link>
                    .
                </div>
            </div>
        </div>
    )
}
