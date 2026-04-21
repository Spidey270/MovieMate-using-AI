import { useState, useEffect } from "react";
import { api, useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X, User, Mail, Lock, Film } from "lucide-react";

export default function AuthModal({ isOpen, onClose, initialView = "login" }) {
  const [view, setView] = useState(initialView); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    } else {
      const timer = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", { username, email, password });
      // Auto login after register
      await login(email, password);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`relative w-full max-w-md mx-4 rounded-2xl bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 shadow-2xl transition-transform duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* Background Effect */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800')] bg-cover bg-center opacity-20" />
        
        <div className="relative p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary mb-3">
              <Film className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {view === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {view === "login" 
                ? "Sign in to continue your movie journey" 
                : "Join MovieMate for personalized picks"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={view === "login" ? handleLogin : handleRegister} className="space-y-4">
            {view === "register" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="bg-zinc-800 border-zinc-700 pl-10"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 pl-10"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-zinc-800 border-zinc-700 pl-10"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full font-bold bg-primary hover:bg-red-600 h-11"
            >
              {loading 
                ? (view === "login" ? "Signing in..." : "Creating account...") 
                : (view === "login" ? "Sign In" : "Create Account")}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-zinc-900 px-2 text-gray-500">OR</span>
            </div>
          </div>

          {/* Switch View */}
          <div className="text-center text-gray-400 text-sm">
            {view === "login" ? (
              <>
                New to MovieMate?{" "}
                <button
                  onClick={() => { setView("register"); setError(""); }}
                  className="text-primary hover:text-red-400 font-medium"
                >
                  Sign up now
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setView("login"); setError(""); }}
                  className="text-primary hover:text-red-400 font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}