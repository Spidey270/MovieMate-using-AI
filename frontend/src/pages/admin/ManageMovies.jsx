import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { ArrowLeft, Film, Plus, Trash2, Pencil, X, Save } from "lucide-react";

const EMPTY_FORM = {
  title: "", overview: "", release_date: "", runtime: 100,
  poster_url: "", backdrop_url: "", trailer_url: "",
  imdb_rating: 0, language: "English", genre_ids: [],
};

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // modal: null | { mode: "create" | "edit", movie?: object }
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchMovies = async () => {
    try {
      const [moviesRes, genresRes] = await Promise.all([
        api.get("/movies/?limit=200"),
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

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal({ mode: "create" });
  };

  const openEdit = (movie) => {
    setForm({
      title: movie.title || "",
      overview: movie.overview || "",
      release_date: movie.release_date || "",
      runtime: movie.runtime || 100,
      poster_url: movie.poster_url || "",
      backdrop_url: movie.backdrop_url || "",
      trailer_url: movie.trailer_url || "",
      imdb_rating: movie.imdb_rating || 0,
      language: movie.language || "English",
      genre_ids: movie.genres?.map((g) => g.id) || [],
    });
    setModal({ mode: "edit", movie });
  };

  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        imdb_rating: parseFloat(form.imdb_rating),
        runtime: parseInt(form.runtime),
      };
      if (modal.mode === "create") {
        await api.post("/admin/movies", payload);
        alert("Movie created!");
      } else {
        await api.patch(`/admin/movies/${modal.movie.id}`, payload);
        alert("Movie updated!");
      }
      closeModal();
      fetchMovies();
    } catch {
      alert(`Failed to ${modal.mode === "create" ? "create" : "update"} movie.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This will also remove all its reviews.`)) return;
    try {
      await api.delete(`/admin/movies/${id}`);
      setMovies(movies.filter((m) => m.id !== id));
    } catch {
      alert("Failed to delete movie.");
    }
  };

  const toggleGenre = (id) => {
    setForm((f) => ({
      ...f,
      genre_ids: f.genre_ids.includes(id)
        ? f.genre_ids.filter((g) => g !== id)
        : [...f.genre_ids, id],
    }));
  };

  const inp = "w-full bg-zinc-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition text-sm";

  return (
    <div className="min-h-screen bg-secondary pb-20">
      <Navbar />
      <div className="pt-24 mx-auto max-w-7xl px-4">

        {/* Header */}
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
            onClick={openCreate}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-5 py-2.5 rounded-lg transition"
          >
            <Plus className="h-5 w-5" /> Add Movie
          </button>
        </div>

        {/* Movie Grid */}
        {loading ? (
          <p className="text-gray-400">Loading movies...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((m) => (
              <div
                key={m.id}
                className="bg-zinc-900 border border-gray-800 rounded-xl flex gap-4 p-4 hover:border-amber-500/30 transition group"
              >
                <img
                  src={m.poster_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.title)}&background=27272a&color=fff`}
                  className="h-20 w-14 object-cover rounded-lg flex-shrink-0 bg-zinc-800"
                  alt={m.title}
                />
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-white truncate">{m.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {m.release_date?.slice(0, 4)} · ⭐ {m.imdb_rating} · {m.language}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{m.overview}</p>
                </div>
                {/* Actions — visible on hover */}
                <div className="flex flex-col gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openEdit(m)}
                    className="text-gray-400 hover:text-amber-400 transition"
                    title="Edit Movie"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id, m.title)}
                    className="text-gray-600 hover:text-red-500 transition"
                    title="Delete Movie"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Create / Edit Modal ─────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-amber-400">
                {modal.mode === "create" ? "Add New Movie" : `Edit — ${modal.movie.title}`}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Title *</label>
                  <input required className={inp} placeholder="Movie title" value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Release Date</label>
                  <input className={inp} placeholder="YYYY-MM-DD" value={form.release_date}
                    onChange={(e) => setForm({ ...form, release_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Language</label>
                  <input className={inp} placeholder="English" value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Runtime (mins)</label>
                  <input type="number" className={inp} value={form.runtime}
                    onChange={(e) => setForm({ ...form, runtime: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">IMDb Rating (0–10)</label>
                  <input type="number" step="0.1" min="0" max="10" className={inp} value={form.imdb_rating}
                    onChange={(e) => setForm({ ...form, imdb_rating: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Poster URL</label>
                  <input className={inp} placeholder="https://..." value={form.poster_url}
                    onChange={(e) => setForm({ ...form, poster_url: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Backdrop URL</label>
                  <input className={inp} placeholder="https://..." value={form.backdrop_url}
                    onChange={(e) => setForm({ ...form, backdrop_url: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Trailer URL (YouTube)</label>
                  <input className={inp} placeholder="https://youtube.com/watch?v=..." value={form.trailer_url}
                    onChange={(e) => setForm({ ...form, trailer_url: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Overview *</label>
                  <textarea required className={`${inp} min-h-[80px] resize-none`} placeholder="Movie description..."
                    value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} />
                </div>
              </div>

              {/* Genre picker */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Genres</p>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <button
                      type="button" key={g.id} onClick={() => toggleGenre(g.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                        form.genre_ids.includes(g.id)
                          ? "bg-amber-500 text-black border-amber-500"
                          : "border-gray-700 text-gray-400 hover:border-amber-500"
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview poster if URL is set */}
              {form.poster_url && (
                <div className="flex items-center gap-4 bg-zinc-800 rounded-xl p-3">
                  <img src={form.poster_url} alt="Preview" className="h-20 w-14 object-cover rounded-lg bg-zinc-700" onError={(e) => e.target.style.display = "none"} />
                  <p className="text-xs text-gray-400">Poster preview</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={submitting}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-2.5 rounded-lg transition disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {submitting ? "Saving..." : modal.mode === "create" ? "Create Movie" : "Save Changes"}
                </button>
                <button type="button" onClick={closeModal}
                  className="border border-gray-700 text-gray-400 hover:text-white px-6 py-2.5 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
