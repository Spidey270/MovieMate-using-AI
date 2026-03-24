import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { ArrowLeft, Film, Plus, Trash2, AlertCircle } from "lucide-react";

const GENRES_PLACEHOLDER = [];

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", overview: "", release_date: "", runtime: 100,
    poster_url: "", backdrop_url: "", trailer_url: "",
    imdb_rating: 0, language: "English", genre_ids: [],
  });

  const fetchMovies = async () => {
    try {
      const [moviesRes, genresRes] = await Promise.all([
        api.get("/movies/?limit=100"),
        api.get("/genres/"),
      ]);
      setMovies(moviesRes.data);
      setGenres(genresRes.data);
    } catch (err) {
      console.error("Failed to load movies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovies(); }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This will also remove all its reviews.`)) return;
    try {
      await api.delete(`/admin/movies/${id}`);
      setMovies(movies.filter((m) => m.id !== id));
    } catch {
      alert("Failed to delete movie.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, imdb_rating: parseFloat(form.imdb_rating), runtime: parseInt(form.runtime) };
      await api.post("/admin/movies", payload);
      alert("Movie created!");
      setShowForm(false);
      setForm({ title: "", overview: "", release_date: "", runtime: 100, poster_url: "", backdrop_url: "", trailer_url: "", imdb_rating: 0, language: "English", genre_ids: [] });
      fetchMovies();
    } catch {
      alert("Failed to create movie.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGenre = (id) => {
    setForm((f) => ({
      ...f,
      genre_ids: f.genre_ids.includes(id) ? f.genre_ids.filter((g) => g !== id) : [...f.genre_ids, id],
    }));
  };

  const inp = "w-full bg-zinc-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition text-sm";

  return (
    <div className="min-h-screen bg-secondary pb-20">
      <Navbar />
      <div className="pt-24 mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-gray-400 hover:text-white transition">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Film className="h-8 w-8 text-amber-400" /> Manage Movies
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-5 py-2.5 rounded-lg transition"
          >
            <Plus className="h-5 w-5" /> Add Movie
          </button>
        </div>

        {/* Add Movie Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="mb-10 bg-zinc-900 border border-amber-500/30 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-amber-400 mb-4">New Movie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required className={inp} placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input className={inp} placeholder="Release Date (YYYY-01-01)" value={form.release_date} onChange={(e) => setForm({ ...form, release_date: e.target.value })} />
              <input className={inp} placeholder="Poster URL" value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })} />
              <input className={inp} placeholder="Backdrop URL" value={form.backdrop_url} onChange={(e) => setForm({ ...form, backdrop_url: e.target.value })} />
              <input className={inp} placeholder="Trailer URL (YouTube)" value={form.trailer_url} onChange={(e) => setForm({ ...form, trailer_url: e.target.value })} />
              <input className={inp} placeholder="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
              <input type="number" className={inp} placeholder="Runtime (mins)" value={form.runtime} onChange={(e) => setForm({ ...form, runtime: e.target.value })} />
              <input type="number" step="0.1" max="10" className={inp} placeholder="IMDb Rating (0-10)" value={form.imdb_rating} onChange={(e) => setForm({ ...form, imdb_rating: e.target.value })} />
            </div>
            <textarea required className={`${inp} min-h-[80px]`} placeholder="Overview *" value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} />
            <div>
              <p className="text-sm text-gray-400 mb-2">Genres</p>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button type="button" key={g.id} onClick={() => toggleGenre(g.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition ${form.genre_ids.includes(g.id) ? "bg-amber-500 text-black border-amber-500" : "border-gray-700 text-gray-400 hover:border-amber-500"}`}>
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-2.5 rounded-lg transition disabled:opacity-50">
                {submitting ? "Creating..." : "Create Movie"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-gray-700 text-gray-400 hover:text-white px-6 py-2.5 rounded-lg transition">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Movie List */}
        {loading ? (
          <p className="text-gray-400">Loading movies...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((m) => (
              <div key={m.id} className="bg-zinc-900 border border-gray-800 rounded-xl flex gap-4 p-4 hover:border-amber-500/30 transition group">
                <img
                  src={m.poster_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.title)}&background=27272a&color=fff`}
                  className="h-20 w-14 object-cover rounded-lg flex-shrink-0 bg-zinc-800"
                  alt={m.title}
                />
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-white truncate">{m.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.release_date?.slice(0, 4)} · ⭐ {m.imdb_rating}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{m.overview}</p>
                </div>
                <button
                  onClick={() => handleDelete(m.id, m.title)}
                  className="flex-shrink-0 text-gray-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                  title="Delete Movie"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
