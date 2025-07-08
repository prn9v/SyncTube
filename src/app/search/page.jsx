"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import PlaylistCard from "@/components/PlaylistCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, X, Music, Play, ExternalLink } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSpotifyComprehensiveSearch } from "@/hooks/useSpotify";
import { useRouter } from "next/navigation";
import LoadingSpinner from '@/components/LoadingSpinner';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTrack, setCurrentTrack] = useState(null);
  const { searchResults, loading, error, searchAll } = useSpotifyComprehensiveSearch();
  const router = useRouter();
  

  const mockCategories = [
    { name: "Pop", imageUrl: "https://via.placeholder.com/200?text=Pop" },
    { name: "Rock", imageUrl: "https://via.placeholder.com/200?text=Rock" },
    {
      name: "Hip Hop",
      imageUrl: "https://via.placeholder.com/200?text=Hip+Hop",
    },
    {
      name: "Electronic",
      imageUrl: "https://via.placeholder.com/200?text=Electronic",
    },
    { name: "RnB", imageUrl: "https://via.placeholder.com/200?text=RnB" },
    { name: "Jazz", imageUrl: "https://via.placeholder.com/200?text=Jazz" },
    {
      name: "Classical",
      imageUrl: "https://via.placeholder.com/200?text=Classical",
    },
    {
      name: "Country",
      imageUrl: "https://via.placeholder.com/200?text=Country",
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    searchAll(searchQuery, 20);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // New function to handle category clicks
  const handleCategoryClick = (categoryName) => {
    setSearchQuery(categoryName);
    searchAll(categoryName, 20);
  };

  // Helper function to format duration from milliseconds
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  // Helper function to get the best image URL
  const getImageUrl = (images, fallback = "https://via.placeholder.com/200?text=No+Image") => {
    if (!images || images.length === 0) return fallback;
    // Prefer medium size image, fallback to first available
    const mediumImage = images.find(img => img.width >= 200 && img.width <= 400);
    return mediumImage ? mediumImage.url : images[0].url;
  };

  // Check if we have any search results
  const hasSearchResults = searchResults.tracks.length > 0 || 
                          searchResults.artists.length > 0 || 
                          searchResults.playlists.length > 0;

  return (
    <ProtectedRoute>
        <div className="flex h-screen bg-black text-white overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto pb-24 pt-4 px-6">
            {/* Search Bar */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="What do you want to listen to?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 bg-dark border-white text-lg rounded-full"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </form>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
                <p className="text-red-400">Error: {error}</p>
              </div>
            )}

            {/* Search Results or Browse */}
            {hasSearchResults ? (
              // Tabs for All / Tracks / Artists / Playlists
              <Tabs defaultValue="all" className="w-full space-y-8 ">
                <TabsList className="mb-6 bg-black border border-white ">
                  <TabsTrigger className="cursor-pointer text-gray-400 hover:opacity-60 transition-opacity data-[state=active]:text-black" value="all">All</TabsTrigger>
                  <TabsTrigger className="cursor-pointer text-gray-400 hover:opacity-60 transition-opacity data-[state=active]:text-black" value="tracks">Tracks</TabsTrigger>
                  <TabsTrigger className="cursor-pointer text-gray-400 hover:opacity-60 transition-opacity data-[state=active]:text-black" value="artists">Artists</TabsTrigger>
                  <TabsTrigger className="cursor-pointer text-gray-400 hover:opacity-60 transition-opacity data-[state=active]:text-black" value="playlists">Playlists</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-8">
                  {/* Top Result */}
                  {searchResults.artists.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Top result</h2>
                      <div className="bg-spotify-light p-5 rounded-lg hover:bg-spotify-dark flex gap-4 transition-colors">
                        <img
                          src={getImageUrl(searchResults.artists[0].images)}
                          alt={searchResults.artists[0].name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-2xl font-bold">
                            {searchResults.artists[0].name}
                          </h3>
                          <p className="text-sm text-spotify-offwhite mt-1">
                            Artist • {searchResults.artists[0].followers.toLocaleString()} followers
                          </p>
                          {searchResults.artists[0] && (
                            <Button 
                              className="mt-4 bg-spotify-green hover:bg-opacity-80 cursor-pointer"
                              onClick={() => router.push(`/artist/${searchResults.artists[0].id}`)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Play
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Track Results */}
                  {searchResults.tracks.length > 0 && (
                    <TracksTable results={searchResults.tracks} setCurrentTrack={setCurrentTrack} />
                  )}

                  {/* Artist Cards */}
                  {searchResults.artists.length > 0 && (
                    <ArtistsGrid artists={searchResults.artists} />
                  )}

                  {/* Playlist Cards */}
                  {searchResults.playlists.length > 0 && (
                    <PlaylistsGrid playlists={searchResults.playlists} />
                  )}
                </TabsContent>

                <TabsContent value="tracks">
                  {searchResults.tracks.length > 0 ? (
                    <TracksTable results={searchResults.tracks} setCurrentTrack={setCurrentTrack} />
                  ) : (
                    <div className="text-center py-12 text-spotify-offwhite">
                      No tracks found
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="artists">
                  {searchResults.artists.length > 0 ? (
                    <ArtistsGrid artists={searchResults.artists} />
                  ) : (
                    <div className="text-center py-12 text-spotify-offwhite">
                      No artists found
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="playlists">
                  {searchResults.playlists.length > 0 ? (
                    <PlaylistsGrid playlists={searchResults.playlists} />
                  ) : (
                    <div className="text-center py-12 text-spotify-offwhite">
                      No playlists found
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              // Browse all categories
              <div className="space-y-8">
                <h2 className="text-xl font-semibold">Browse all</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {mockCategories.map((category, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-lg aspect-square cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: `hsl(${index * 45}, 60%, 50%)` }}
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      <div className="p-4 h-full flex items-start">
                        <h3 className="text-2xl font-bold z-10">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <LoadingSpinner />
            )}
          </main>
          <MusicPlayer track={currentTrack} />
        </div>
    </ProtectedRoute>
  );
};

export default Search;

// Subcomponents
const TracksTable = ({ results, setCurrentTrack }) => {
  // Helper function to format duration from milliseconds
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tracks</h2>
      <div className="bg-spotify-light rounded-lg overflow-hidden">
        <table className="w-full">
          <tbody>
            {results.map((track, index) => (
              <tr
                key={track.id}
                className="hover:bg-spotify-dark transition-colors cursor-pointer"
                onClick={() => setCurrentTrack(track)}
              >
                <td className="p-4 w-10 text-spotify-offwhite">{index + 1}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-spotify-dark rounded flex-shrink-0 overflow-hidden">
                      {track.album?.images?.[0] ? (
                        <img 
                          src={track.album.images[0].url} 
                          alt={track.album.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="h-6 w-6 m-2 text-spotify-offwhite" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{track.name}</p>
                      <p className="text-sm text-spotify-offwhite">
                        {track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-spotify-offwhite">{track.album?.name || 'Unknown Album'}</td>
                <td className="p-4 text-right text-spotify-offwhite">
                  {formatDuration(track.duration_ms)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ArtistsGrid = ({ artists }) => {
  const router = useRouter();
  // Helper function to get the best image URL
  const getImageUrl = (images, fallback = "https://via.placeholder.com/200?text=No+Image") => {
    if (!images || images.length === 0) return fallback;
    const mediumImage = images.find(img => img.width >= 200 && img.width <= 400);
    return mediumImage ? mediumImage.url : images[0].url;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Artists</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="group cursor-pointer"
            onClick={() => router.push(`/artist/${artist.id}`)}
          >
            <div className="relative overflow-hidden rounded-lg aspect-square bg-spotify-light group-hover:bg-spotify-dark transition-colors">
              <img
                src={getImageUrl(artist.images)}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                <Button 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 bg-black hover:bg-opacity-80 cursor-pointer"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-medium truncate">{artist.name}</h3>
              <p className="text-sm text-spotify-offwhite truncate">
                {artist.followers.toLocaleString()} followers
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlaylistsGrid = ({ playlists }) => {
  const router = useRouter();
  // Helper function to get the best image URL
  const getImageUrl = (images, fallback = "https://via.placeholder.com/200?text=No+Image") => {
    if (!images || images.length === 0) return fallback;
    const mediumImage = images.find(img => img.width >= 200 && img.width <= 400);
    return mediumImage ? mediumImage.url : images[0].url;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Playlists</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="group cursor-pointer"
            onClick={() => router.push(`/playlist/${playlist.id}`)}
          >
            <div className="relative overflow-hidden rounded-lg aspect-square bg-spotify-light group-hover:bg-spotify-dark transition-colors">
              <img
                src={getImageUrl(playlist.images)}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                <Button 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 bg-black hover:bg-opacity-80 cursor-pointer"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-medium truncate">{playlist.name}</h3>
              <p className="text-sm text-spotify-offwhite truncate">
                {playlist.owner} • {playlist.tracks_count} tracks
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
