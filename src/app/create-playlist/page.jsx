"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, Music, Search, Plus, X } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import ProtectedRoute from "@/components/ProtectedRoute";

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

  const mockSongs = [
    {
      id: 1,
      title: "Never Gonna Give You Up",
      artist: "Rick Astley",
      album: "Whenever You Need Somebody",
      duration: "3:32",
    },
    {
      id: 2,
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      duration: "3:20",
    },
    {
      id: 3,
      title: "Shape of You",
      artist: "Ed Sheeran",
      album: "÷",
      duration: "3:54",
    },
    {
      id: 4,
      title: "Dance Monkey",
      artist: "Tones and I",
      album: "The Kids Are Coming",
      duration: "3:29",
    },
    {
      id: 5,
      title: "Uptown Funk",
      artist: "Mark Ronson ft. Bruno Mars",
      album: "Uptown Special",
      duration: "4:30",
    },
    {
      id: 6,
      title: "Someone Like You",
      artist: "Adele",
      album: "21",
      duration: "4:45",
    },
    {
      id: 7,
      title: "Despacito",
      artist: "Luis Fonsi ft. Daddy Yankee",
      album: "VIDA",
      duration: "3:47",
    },
  ];

  const filteredSongs = searchQuery
    ? mockSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockSongs;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlaylistData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPlaylistData((prev) => ({
        ...prev,
        coverImage: file,
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSongSelection = (song) => {
    setSelectedSongs((prev) => {
      const isSelected = prev.find((s) => s.id === song.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== song.id);
      } else {
        return [...prev, song];
      }
    });
  };

  const removeSongFromPlaylist = (songId) => {
    setSelectedSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playlistData.name.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    console.log("Creating playlist:", {
      ...playlistData,
      songs: selectedSongs,
    });
    toast.success(`Playlist created with ${selectedSongs.length} songs!`);
    router.push("/playlist");
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-black text-white overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto pb-24 pt-4 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/playlist")}
                className="text-spotify-offwhite hover:text-white"
              >
                <ArrowLeft className="h-6 w-6 text-white" />
              </Button>
              <h1 className="text-3xl font-bold text-white">Create Playlist</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div>
                <Card className="bg-spotify-light border-spotify-dark">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">
                      Playlist Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Cover Image */}
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-40 h-40 bg-spotify-dark rounded-lg flex items-center justify-center border-2 border-dashed border-spotify-offwhite hover:border-green-500 transition-colors cursor-pointer relative overflow-hidden">
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Playlist cover"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                <Music className="h-12 w-12 text-white mx-auto mb-2" />
                                <p className="text-sm text-gray-400">
                                  Add Cover
                                </p>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="flex-1 space-y-4">
                          <div>
                            <Label
                              htmlFor="name"
                              className="text-white font-medium"
                            >
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
                            <Label
                              htmlFor="description"
                              className="text-white font-medium"
                            >
                              Description
                            </Label>
                            <Textarea
                              id="description"
                              name="description"
                              placeholder="Add an optional description..."
                              value={playlistData.description}
                              onChange={handleInputChange}
                              className="bg-spotify-dark border-spotify-dark text-white placeholder-gray-400 mt-2 min-h-[100px]"
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Selected Songs Preview */}
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
                                  <p className="text-white font-medium">
                                    {song.title}
                                  </p>
                                  <p className="text-gray-400 text-sm">
                                    {song.artist}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeSongFromPlaylist(song.id)
                                  }
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
                          className="bg-green-400 hover:bg-green-700 font-semibold  cursor-pointer text-white"
                        >
                          Create Playlist
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Add Songs */}
              <div>
                <Card className="bg-spotify-light border-spotify-dark">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">
                      Add Songs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-spotify-offwhite" />
                      <Input
                        placeholder="Search for songs to add"
                        className="pl-10 bg-spotify-dark border-spotify-dark text-white placeholder-spotify-offwhite"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredSongs.map((song) => {
                        const isSelected = selectedSongs.find(
                          (s) => s.id === song.id
                        );
                        return (
                          <div
                            key={song.id}
                            className="flex items-center gap-3 p-3 bg-spotify-dark rounded-lg hover:bg-opacity-80 transition-colors"
                          >
                            <Checkbox
                              checked={!!isSelected}
                              onCheckedChange={() => toggleSongSelection(song)}
                              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            />
                            <div className="h-10 w-10 bg-spotify-black rounded flex-shrink-0">
                              <Music className="h-6 w-6 m-2 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">
                                {song.title}
                              </p>
                              <p className="text-sm text-gray-400 truncate">
                                {song.artist} • {song.album}
                              </p>
                            </div>
                            <span className="text-gray-400 text-sm">
                              {song.duration}
                            </span>
                          </div>
                        );
                      })}

                      {filteredSongs.length === 0 && (
                        <div className="py-8 text-center">
                          <p className="text-red-500">
                            No songs found matching your search
                          </p>
                        </div>
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
    </ProtectedRoute>
  );
};

export default CreatePlaylist;
