import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { Plus, Folder, Film, Trash2, Edit } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: "", description: "" });
  const { addToast } = useToast();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await api.get("/collections/");
      setCollections(response.data);
    } catch (error) {
      addToast("Failed to load collections", "error");
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    if (!newCollection.name.trim()) {
      addToast("Please enter a collection name", "error");
      return;
    }

    try {
      await api.post("/collections/", newCollection);
      addToast("Collection created", "success");
      setShowCreateModal(false);
      setNewCollection({ name: "", description: "" });
      fetchCollections();
    } catch (error) {
      addToast("Failed to create collection", "error");
    }
  };

  const deleteCollection = async (collectionId) => {
    if (!window.confirm("Are you sure you want to delete this collection?")) return;

    try {
      await api.delete(`/collections/${collectionId}`);
      addToast("Collection deleted", "success");
      fetchCollections();
    } catch (error) {
      addToast("Failed to delete collection", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />

      <div className="pt-24 mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">My Collections</h1>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-red-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Collection
          </Button>
        </div>

        {collections.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl p-12 text-center border border-white/5">
            <Folder className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-4">No collections yet</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-red-700"
            >
              Create Your First Collection
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="bg-zinc-900 rounded-xl p-6 border border-white/5 hover:border-primary/50 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Folder className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-bold text-lg">{collection.name}</h3>
                      <p className="text-sm text-gray-400">
                        {collection.movie_count} movies
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCollection(collection.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                {collection.description && (
                  <p className="text-gray-400 text-sm mb-4">{collection.description}</p>
                )}
                <Link
                  to={`/collections/${collection.id}`}
                  className="text-primary hover:underline text-sm"
                >
                  View collection →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl p-8 max-w-md w-full border border-white/10">
            <h2 className="text-2xl font-bold mb-6">Create Collection</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Collection Name</label>
                <input
                  type="text"
                  value={newCollection.name}
                  onChange={(e) =>
                    setNewCollection({ ...newCollection, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  placeholder="e.g., My Favorites"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) =>
                    setNewCollection({ ...newCollection, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  placeholder="Describe your collection..."
                  rows="3"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={createCollection}
                className="flex-1 bg-primary hover:bg-red-700"
              >
                Create
              </Button>
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCollection({ name: "", description: "" });
                }}
                variant="outline"
                className="flex-1 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
