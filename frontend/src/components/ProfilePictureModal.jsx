import { useState, useRef } from "react";
import { api, useAuth } from "../context/AuthContext";
import { X, Upload, Check } from "lucide-react";

const PREDEFINED_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sadie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Rocky",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoey",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Prudy",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Duke",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Cooper",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Penny",
];

export default function ProfilePictureModal({ isOpen, onClose, onSave }) {
  const { user } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.profile_picture || null);
  const [customImage, setCustomImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result);
        setSelectedAvatar(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      const profile_picture = customImage || selectedAvatar;
      await api.put("/auth/profile-picture", { profile_picture });
      onSave(profile_picture);
    } catch (error) {
      console.error("Failed to update profile picture", error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md mx-4 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Change Profile Picture</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Custom Upload */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Upload from Device
          </h3>
          <div
            className="border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition"
            onClick={() => fileInputRef.current?.click()}
          >
            {customImage ? (
              <img
                src={customImage}
                alt="Custom"
                className="h-24 w-24 rounded-full mx-auto object-cover"
              />
            ) : (
              <div className="py-4">
                <Upload className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                <p className="text-gray-400 text-sm">Click to upload an image</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Predefined Avatars */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Choose an Avatar
          </h3>
          <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
            {PREDEFINED_AVATARS.map((avatar, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedAvatar(avatar);
                  setCustomImage(null);
                }}
                className={`relative rounded-full overflow-hidden border-2 transition ${
                  selectedAvatar === avatar
                    ? "border-primary ring-2 ring-primary/50"
                    : "border-transparent hover:border-zinc-600"
                }`}
              >
                <img
                  src={avatar}
                  alt={`Avatar ${index + 1}`}
                  className="h-10 w-10 object-cover"
                />
                {selectedAvatar === avatar && (
                  <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {(customImage || selectedAvatar) && (
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Preview</p>
            <img
              src={customImage || selectedAvatar}
              alt="Preview"
              className="h-20 w-20 rounded-full mx-auto object-cover border-4 border-zinc-800"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-zinc-700 text-gray-300 hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={uploading || (!customImage && !selectedAvatar)}
            className="flex-1 py-2 px-4 rounded-lg bg-primary text-white hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}