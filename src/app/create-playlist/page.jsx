"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Music, Search, X } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession } from "next-auth/react";
import { useSpotifyComprehensiveSearch } from "@/hooks/useSpotify";

const CreatePlaylist = () => {
  const router = useRouter();
  const [playlistData, setPlaylistData] = useState({
    name: "",
    description: "",
    coverImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSongs, setSelectedSongs] = useState([]);
  const { data: session } = useSession();
  const { searchResults, loading, error, searchAll } = useSpotifyComprehensiveSearch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format duration from milliseconds
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  // Get best Spotify image
  const getImageUrl = (images, fallback = "https://via.placeholder.com/200?text=No+Image") => {
    if (!images || images.length === 0) return fallback;
    const mediumImage = images.find((img) => img.width >= 200 && img.width <= 400);
    return mediumImage ? mediumImage.url : images[0].url;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    searchAll(searchQuery, 20);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlaylistData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPlaylistData((prev) => ({ ...prev, coverImage: file }));

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleSongSelection = (track) => {
    setSelectedSongs((prev) => {
      const exists = prev.find((s) => s.id === track.id);
      if (exists) {
        return prev.filter((s) => s.id !== track.id);
      } else {
        return [
          ...prev,
          {
            id: track.id,
            title: track.name,
            artist: track.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
            album: track.album?.name || "Unknown Album",
            duration: formatDuration(track.duration_ms),
            spotifyData: track,
          },
        ];
      }
    });
  };

  const removeSongFromPlaylist = (songId) => {
    setSelectedSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!playlistData.name.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Please log in to create a playlist");
      return;
    }

    if (selectedSongs.length === 0) {
      toast.error("Please select at least one song");
      return;
    }

    setIsSubmitting(true);

    try {
      const playlistPayload = {
        playlistName: playlistData.name,
        description: playlistData.description,
        coverUrl: imagePreview,
        songs: selectedSongs,
        owner: session.user.id,
      };

      const { data } = await axios.post("/api/playlist", playlistPayload);

      toast.success(`Playlist "${playlistData.name}" created successfully! 🎶`);

      // Reset form
      setPlaylistData({ name: "", description: "", coverImage: null });
      setImagePreview(null);
      setSelectedSongs([]);
      setSearchQuery("");

      router.push("/profile");
    } catch (err) {
      console.error("Create playlist error:", err);
      const message = err.response?.data?.error || "Failed to create playlist";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-black min-h-screen flex flex-col">
        <div className="flex flex-col md:flex-row flex-1 bg-black text-white overflow-hidden">
          <div className="w-full md:w-64 flex-shrink-0">
            <Sidebar />
          </div>

          <main className="flex-1 overflow-y-auto pb-24 pt-4 px-2 sm:px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/playlist")}
                  className="text-spotify-offwhite hover:text-white"
                >
                  <ArrowLeft className="h-6 w-6 text-white" />
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Create Playlist</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* LEFT COLUMN: Playlist Info */}
                <div>
                  <Card className="bg-spotify-light border-spotify-dark">
                    <CardHeader>
                      <CardTitle className="text-white text-xl">Playlist Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Cover Image */}
                        <div className="flex items-start gap-6">
                          <div className="w-40 h-40 bg-spotify-dark rounded-lg flex items-center justify-center border-2 border-dashed border-spotify-offwhite hover:border-green-500 transition-colors cursor-pointer relative overflow-hidden">
                            {imagePreview ? (
                              <img src={imagePreview} alt="Playlist cover" className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-center">
                                <Music className="h-12 w-12 text-white mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Add Cover</p>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>

                          <div className="flex-1 space-y-4">
                            <div>
                              <Label htmlFor="name" className="text-white font-medium">
                                Playlist Name *
                              </Label>
                              <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="My Awesome Playlist"
                                value={playlistData.name}
                                onChange={handleInputChange}
                                className="bg-spotify-dark border-spotify-dark text-white placeholder-white mt-2"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="description" className="text-white font-medium">
                                Description
                              </Label>
                              <Textarea
                                id="description"
                                name="description"
                                placeholder="Add an optional description..."
                                value={playlistData.description}
                                onChange={handleInputChange}
                                className="bg-spotify-dark border-spotify-dark text-white placeholder-gray-400 mt-2 min-h-[100px]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Selected Songs */}
                        {selectedSongs.length > 0 && (
                          <div>
                            <h3 className="text-white font-semibold mb-3">
                              Selected Songs ({selectedSongs.length})
                            </h3>
                            <div className="bg-spotify-dark rounded-lg p-4 max-h-60 overflow-y-auto">
                              {selectedSongs.map((song) => (
                                <div
                                  key={song.id}
                                  className="flex items-center justify-between py-2 border-b border-spotify-light last:border-b-0"
                                >
                                  <div>
                                    <p className="text-white font-medium">{song.title}</p>
                                    <p className="text-gray-400 text-sm">{song.artist}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSongFromPlaylist(song.id)}
                                    className="h-8 w-8 text-white hover:text-white"
                                  >
                                    <X className="h-4 w-4 text-white" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-4 pt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/playlist")}
                            className="border-grey-400 bg-black text-white hover:text-green-400"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-400 hover:bg-green-700 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? "Creating..." : "Create Playlist"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* RIGHT COLUMN: Song Search */}
                <div>
                  <Card className="bg-spotify-light border-spotify-dark">
                    <CardHeader>
                      <CardTitle className="text-white text-xl">Add Songs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSearch} className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search for songs to add"
                          className="pl-10 bg-spotify-dark border-spotify-dark text-white placeholder-spotify-offwhite"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </form>

                      {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
                          <p className="text-red-400">Error: {error}</p>
                        </div>
                      )}

                      {loading && (
                        <div className="flex justify-center py-8">
                          <div className="animate-pulse text-center">
                            <Music className="h-8 w-8 text-spotify-green mx-auto" />
                            <p className="mt-2 text-sm text-spotify-offwhite">Searching...</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {searchResults.tracks?.length > 0 ? (
                          searchResults.tracks.map((track) => {
                            const isSelected = selectedSongs.find((s) => s.id === track.id);
                            return (
                              <div
                                key={track.id}
                                className="flex items-center gap-3 p-3 bg-spotify-dark rounded-lg hover:bg-opacity-80 transition-colors"
                              >
                                <Checkbox
                                  checked={!!isSelected}
                                  onCheckedChange={() => toggleSongSelection(track)}
                                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                />
                                <div className="h-10 w-10 bg-spotify-black rounded overflow-hidden flex-shrink-0">
                                  {track.album?.images?.[0] ? (
                                    <img
                                      src={track.album.images[0].url}
                                      alt={track.album.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Music className="h-6 w-6 m-2 text-white" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white truncate">{track.name}</p>
                                  <p className="text-sm text-gray-400 truncate">
                                    {track.artists?.map((a) => a.name).join(", ")} •{" "}
                                    {track.album?.name || "Unknown Album"}
                                  </p>
                                </div>
                                <span className="text-gray-400 text-sm">
                                  {track.duration_ms ? formatDuration(track.duration_ms) : "Unknown"}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          searchQuery &&
                          !loading && (
                            <div className="py-8 text-center text-gray-400">
                              No tracks found. Try a different song.
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>

          <MusicPlayer />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreatePlaylist;
