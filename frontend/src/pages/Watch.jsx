import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api, useAuth } from "../context/AuthContext";
import { Play, Film, Star, Clock, Globe, Plus, Check,
         Tv, ChevronRight, ArrowLeft, Lock, MessageCircle, Send, User, CornerDownRight, X } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Platform brand colors
const PLATFORM_STYLES = {
  Netflix:   "bg-[#E50914]",
  Prime:     "bg-[#00A8E0]",
  "Disney+": "bg-[#0063E5]",
  "Apple TV+":"bg-zinc-600",
  "HBO Max":  "bg-[#5822B4]",
};

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}?autoplay=1&rel=0`;
  const long = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (long) return `https://www.youtube.com/embed/${long[1]}?autoplay=1&rel=0`;
  if (url.includes("youtube.com/embed/")) return url + "?autoplay=1&rel=0";
  return null;
}

function CommentItem({ comment, onReply, user }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReply(comment.id, replyText);
      setReplyText("");
      setShowReplyForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-3">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {comment.username?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">{comment.username}</span>
            <span className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-300">{comment.content}</p>
          {user && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary mt-2 transition"
            >
              <CornerDownRight className="h-3 w-3" />
              Reply
            </button>
          )}
          
          {/* Reply Form */}
          {showReplyForm && (
            <form onSubmit={handleSubmitReply} className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.username}...`}
                className="flex-grow bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || submitting}
                className="bg-primary hover:bg-red-700 text-white p-2 rounded-full transition disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                className="text-gray-500 hover:text-white p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Replies */}
          {comment.replies?.length > 0 && (
            <div className="mt-3 ml-4 pl-4 border-l-2 border-zinc-800 space-y-3">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {reply.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-white">{reply.username}</span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(reply.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Watch() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trailer"); // "full" | "trailer"
  const [activeMirror, setActiveMirror] = useState(0); // 0, 1, 2...
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentsEndRef = useRef(null);

  const mirrors = [
    { name: "StreamFlix", url: (id) => `https://vidsrc.to/embed/movie/${id}` },
    { name: "MovieHub", url: (id) => `https://vidsrc.xyz/embed/movie/${id}` },
    { name: "CinemaStream", url: (id) => `https://player.vidsrc.nl/embed/${id}` },
    { name: "FilmFlix", url: (id) => `https://v2.vidsrc.ml/embed/${id}` },
    { name: "VidPlay", url: (id) => `https://www.2embed.cc/embed/${id}` },
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        const [movieRes, linksRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/streaming/links/${id}`),
        ]);
        const mData = movieRes.data;
        setMovie(mData);
        setLinks(linksRes.data);

        if (user && (mData.imdb_id || mData.archive_url)) {
          setActiveTab("full");
        } else {
          setActiveTab("trailer");
        }

        if (user) {
          api.post(`/streaming/watch/${id}`).catch(() => {});
        }

        if (user) {
          const wRes = await api.get("/wishlist/");
          setIsInWishlist(wRes.data.some((w) => w.movie_id === id));
        }

        const movRes = await api.get("/movies/?limit=8");
        setRelatedMovies(movRes.data.filter((m) => m.id !== id).slice(0, 5));

        // Fetch comments
        const commentsRes = await api.get(`/comments/movie/${id}`);
        setComments(commentsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user]);

  const fetchComments = async () => {
    try {
      const commentsRes = await api.get(`/comments/movie/${id}`);
      setComments(commentsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post("/comments/", {
        movie_id: id,
        content: newComment,
      });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = async (parentId, content) => {
    await api.post("/comments/", {
      movie_id: id,
      content: content,
      parent_id: parentId,
    });
    fetchComments();
  };

  const handleWishlist = async () => {
    if (!user) { navigate("/login"); return; }
    if (isInWishlist) {
      try {
        await api.delete(`/wishlist/${id}`);
        setIsInWishlist(false);
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        await api.post("/wishlist/", { movie_id: id });
        setIsInWishlist(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!movie) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      Movie not found. <Link to="/movies" className="ml-2 text-primary underline">Browse movies</Link>
    </div>
  );

  const trailerEmbed = getYouTubeEmbedUrl(movie.trailer_url);
  const hasFullMovie  = !!(movie.imdb_id || movie.archive_url);
  const hasTrailer    = !!trailerEmbed;

  // Final Embed logic using multiple mirrors
  const embedSrc = activeTab === "full" && hasFullMovie && user
    ? (movie.imdb_id ? mirrors[activeMirror].url(movie.imdb_id) : movie.archive_url)
    : (activeTab === "trailer" ? trailerEmbed : null);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ─── Top bar ─── */}
      <div className="flex items-center gap-4 px-6 py-4 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Link to="/" className="text-xl font-black text-primary tracking-tight">MovieMate</Link>
        <span className="text-gray-600">|</span>
        <span className="text-sm text-gray-300 truncate">{movie.title} ({movie.release_date?.slice(0, 4)})</span>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* ─── PLAYER ─── */}
        <div className="flex-1 flex flex-col">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-zinc-900 px-4 pt-3 flex-shrink-0">
            {hasFullMovie && (
              <button
                onClick={() => user ? setActiveTab("full") : navigate("/login")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-semibold transition ${
                  activeTab === "full"
                    ? "bg-black text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Tv className="h-4 w-4" />
                Full Movie
                {!user ? (
                   <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full ml-1 font-bold">🔒 LOGIN REQUIRE</span>
                ) : (
                   <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/30 font-bold">FREE</span>
                )}
              </button>
            )}
            {hasTrailer && (
              <button
                onClick={() => setActiveTab("trailer")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-semibold transition ${
                  activeTab === "trailer"
                    ? "bg-black text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Play className="h-4 w-4" />
                Trailer
              </button>
            )}
          </div>

          {/* Video Player or Login Wall */}
          <div className="relative bg-black flex-1 min-h-[400px]" style={{ aspectRatio: "16/9" }}>
            {activeTab === "full" && !user ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-zinc-900 to-black">
                 <Lock className="h-16 w-16 text-primary mb-6" />
                 <h2 className="text-3xl font-bold mb-3">Streaming is for Members</h2>
                 <p className="text-gray-400 mb-8 max-w-sm">Join MovieMate premium community to unlock full movies, 4K streaming and social watches.</p>
                 <Link to="/login" className="bg-primary hover:bg-red-700 text-white font-bold px-10 py-3 rounded-full transition text-lg shadow-xl">Login Now</Link>
                 <button onClick={() => setActiveTab("trailer")} className="mt-4 text-gray-500 hover:text-white text-sm underline underline-offset-4">Or watch the trailer first</button>
               </div>
            ) : embedSrc ? (
              <>
                {activeTab === "full" && (
                  <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-2xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Mirror:</span>
                    {mirrors.map((m, idx) => (
                      <button
                        key={m.name}
                        onClick={() => setActiveMirror(idx)}
                        className={`text-[10px] font-black px-2 py-1 rounded transition ${
                          activeMirror === idx
                            ? "bg-primary text-white"
                            : "text-gray-500 hover:text-white"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
                <iframe
                  key={embedSrc}
                  src={embedSrc}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={movie.title}
                  frameBorder="0"
                  referrerPolicy="no-referrer"
                />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-600 bg-zinc-950">
                <Film className="h-16 w-16 opacity-30" />
                <p className="text-sm">Video content not available in your region</p>
                {activeTab === "full" && <p className="text-xs text-amber-500">Wait... checking for high-speed mirrors...</p>}
              </div>
            )}
          </div>

          {/* Movie Info (below player) */}
          <div className="bg-zinc-950 px-6 py-5 border-t border-white/5 overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-start gap-6 max-w-5xl">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 tracking-tight">{movie.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4 bg-white/5 py-2 px-3 rounded-lg w-fit">
                  {movie.release_date && <span className="font-semibold text-gray-300">{movie.release_date.slice(0, 4)}</span>}
                  {movie.runtime && <span className="flex items-center gap-1.5 border-l border-white/10 pl-4"><Clock className="h-4 w-4" />{movie.runtime} min</span>}
                  {movie.language && <span className="flex items-center gap-1.5 border-l border-white/10 pl-4"><Globe className="h-4 w-4" />{movie.language}</span>}
                  {movie.imdb_rating && (
                    <span className="flex items-center gap-1.5 border-l border-white/10 pl-4 text-amber-400 font-bold">
                      <Star className="h-4 w-4 fill-current" /> {movie.imdb_rating} IMDb
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genres?.map((g) => (
                    <span key={g.id} className="bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-wide cursor-default active:scale-95 transition">{g.name}</span>
                  ))}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed max-w-3xl border-l-2 border-primary/40 pl-4 italic">{movie.overview}</p>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-3 flex-shrink-0">
                <button
                  onClick={handleWishlist}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition shadow-lg ${
                    isInWishlist
                      ? "bg-zinc-800 text-gray-400 hover:bg-zinc-700 border border-white/10"
                      : "bg-primary hover:bg-red-700 text-white shadow-primary/20"
                  }`}
                >
                  {isInWishlist ? <><Check className="h-4 w-4" /> Already in Wishlist</> : <><Plus className="h-4 w-4" /> Quick Add Wishlist</>}
                </button>
                <Link
                  to={`/movie/${id}`}
                  className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition"
                >
                  <Film className="h-4 w-4" /> See More Gallery
                </Link>
              </div>
            </div>

            {/* ─── Streaming Platform Links ─── */}
            {links?.platforms?.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Official Platform Search (Search & Watch)</p>
                <div className="flex flex-wrap gap-3">
                  {links.platforms.map((p) => (
                    <a
                      key={p.name}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-xs font-black text-white transition hover:opacity-100 hover:scale-110 active:scale-95 shadow-md shadow-black/30 group ${PLATFORM_STYLES[p.name] || "bg-zinc-800"}`}
                    >
                      <span className="text-lg opacity-80 group-hover:opacity-100 group-hover:scale-125 transition duration-300">{p.logo}</span>
                      <span className="tracking-wide">{p.name}</span>
                      <ChevronRight className="h-3.5 w-3.5 opacity-40 ml-1 group-hover:translate-x-1 transition" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Comments Section ─── */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5 text-gray-400" />
                <h3 className="text-sm font-bold text-gray-300">Comments ({comments.length})</h3>
              </div>

              {/* Add Comment Form */}
              {user ? (
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-grow">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-grow bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                        />
                        <button
                          type="submit"
                          disabled={!newComment.trim() || submittingComment}
                          className="bg-primary hover:bg-red-700 text-white p-2 rounded-full transition disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-500 mb-6">
                  <Link to="/login" className="text-primary hover:underline">Login</Link> to leave a comment
                </p>
              )}

              {/* Comments List */}
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {comments.length > 0 ? comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-zinc-800/30 rounded-xl">
                    <CommentItem comment={comment} onReply={handleReply} user={user} />
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                )}
                <div ref={commentsEndRef} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── SIDEBAR: Up Next ─── */}
        <div className="lg:w-80 xl:w-96 bg-zinc-950 border-l border-white/5 overflow-y-auto flex-shrink-0">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-black text-[10px] text-gray-600 uppercase tracking-widest">More Recommendations</h3>
            <span className="h-1 w-8 bg-primary rounded-full" />
          </div>
          <div className="divide-y divide-white/5">
            {relatedMovies.length > 0 ? relatedMovies.map((m) => (
              <Link
                key={m.id}
                to={`/watch/${m.id}`}
                className="flex gap-4 p-5 hover:bg-white/5 transition group relative overflow-hidden"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={m.poster_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.title)}&background=27272a&color=fff`}
                    alt={m.title}
                    className="w-20 h-28 object-cover rounded-xl bg-zinc-800 shadow-md group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-xl transition duration-500">
                    <div className="bg-primary/90 rounded-full p-2.5 shadow-lg shadow-black/40">
                      <Play className="h-5 w-5 fill-white text-white translate-x-0.5" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-xs font-black text-white truncate mb-1 group-hover:text-primary transition uppercase tracking-tight">{m.title}</p>
                  <p className="text-[10px] text-gray-500 font-bold mb-2">⭐ {m.imdb_rating || 'N/A'} · {m.release_date?.slice(0, 4)}</p>
                  <p className="text-[10px] text-gray-600 line-clamp-2 leading-relaxed">{m.overview}</p>
                </div>
              </Link>
            )) : (
              <div className="p-10 text-center opacity-20">
                <Film className="h-12 w-12 mx-auto mb-2" />
                <p className="text-xs">No similar titles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
