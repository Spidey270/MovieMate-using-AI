import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Link, useNavigate } from "react-router-dom"

export default function Register() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        try {
            await register(username, email, password)
            navigate("/login")
        } catch (err) {
            console.error("Registration error:", err)
            const detail = err.response?.data?.detail
            if (typeof detail === 'string') {
                setError(detail)
            } else if (Array.isArray(detail)) {
                setError(detail.map(d => d.msg).join(", "))
            } else {
                setError("Failed to register. Please check your inputs.")
            }
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <div className="w-full max-w-md p-8">
                <h1 className="mb-8 text-3xl font-bold">Sign Up</h1>
                {error && <div className="mb-4 text-red-500">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" className="w-full font-bold">
                        Sign Up
                    </Button>
                </form>
                <div className="mt-4 text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-white hover:underline">
                        Sign in
                    </Link>
                    .
                </div>
            </div>
        </div>
    )
}
