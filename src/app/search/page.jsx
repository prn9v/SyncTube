"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import PlaylistCard from "@/components/PlaylistCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, X, Music } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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
    setIsSearching(true);

    setTimeout(() => {
      const results = {
        tracks: [
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
        ],
        artists: [
          {
            title: "Rick Astley",
            imageUrl: "https://via.placeholder.com/200?text=Rick",
            type: "artist",
          },
          {
            title: "The Weeknd",
            imageUrl: "https://via.placeholder.com/200?text=Weeknd",
            type: "artist",
          },
        ],
        playlists: [
          {
            title: "80s Classics",
            description: "The greatest hits from the 1980s",
            imageUrl: "https://via.placeholder.com/200?text=80s",
          },
          {
            title: "Modern Hits",
            description: "Today's top songs",
            imageUrl: "https://via.placeholder.com/200?text=Modern",
          },
        ],
      };

      setSearchResults(results);
      setIsSearching(false);
    }, 1000);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

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

          {/* Search Results or Browse */}
          {Object.keys(searchResults).length > 0 ? (
            // Tabs for All / Tracks / Artists / Playlists
            <Tabs defaultValue="all" className="w-full space-y-8">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="tracks">Tracks</TabsTrigger>
                <TabsTrigger value="artists">Artists</TabsTrigger>
                <TabsTrigger value="playlists">Playlists</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-8">
                {/* Top Result */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Top result</h2>
                  <div className="bg-spotify-light p-5 rounded-lg hover:bg-spotify-dark flex gap-4 transition-colors">
                    <img
                      src={searchResults.artists[0].imageUrl}
                      alt={searchResults.artists[0].title}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-2xl font-bold">
                        {searchResults.artists[0].title}
                      </h3>
                      <p className="text-sm text-spotify-offwhite mt-1">
                        Artist
                      </p>
                      <Button className="mt-4 bg-spotify-green hover:bg-opacity-80">
                        Play
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Track Results */}
                <TracksTable results={searchResults.tracks} />

                {/* Artist Cards */}
                <ArtistsGrid artists={searchResults.artists} />

                {/* Playlist Cards */}
                <PlaylistsGrid playlists={searchResults.playlists} />
              </TabsContent>

              <TabsContent value="tracks">
                <TracksTable results={searchResults.tracks} />
              </TabsContent>

              <TabsContent value="artists">
                <ArtistsGrid artists={searchResults.artists} />
              </TabsContent>

              <TabsContent value="playlists">
                <PlaylistsGrid playlists={searchResults.playlists} />
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
                    className="relative overflow-hidden rounded-lg aspect-square cursor-pointer"
                    style={{ backgroundColor: `hsl(${index * 45}, 60%, 50%)` }}
                  >
                    <div className="p-4 h-full flex items-start">
                      <h3 className="text-xl font-bold z-10">
                        {category.name}
                      </h3>
                    </div>
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="absolute bottom-0 right-0 w-24 h-24 object-cover transform rotate-25 translate-x-4 translate-y-4"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSearching && (
            <div className="flex justify-center py-12">
              <div className="animate-pulse-green">
                <Music className="h-12 w-12 text-spotify-green" />
                <p className="mt-4 text-sm text-spotify-offwhite">
                  Searching...
                </p>
              </div>
            </div>
          )}
        </main>
        <MusicPlayer />
      </div>
    </ProtectedRoute>
  );
};

export default Search;

// Subcomponents
const TracksTable = ({ results }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Tracks</h2>
    <div className="bg-spotify-light rounded-lg overflow-hidden">
      <table className="w-full">
        <tbody>
          {results.map((track, index) => (
            <tr
              key={track.id}
              className="hover:bg-spotify-dark transition-colors"
            >
              <td className="p-4 w-10 text-spotify-offwhite">{index + 1}</td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-spotify-dark rounded flex-shrink-0">
                    <Music className="h-6 w-6 m-2 text-spotify-offwhite" />
                  </div>
                  <div>
                    <p className="font-medium">{track.title}</p>
                    <p className="text-sm text-spotify-offwhite">
                      {track.artist}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-4 text-spotify-offwhite">{track.album}</td>
              <td className="p-4 text-right text-spotify-offwhite">
                {track.duration}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ArtistsGrid = ({ artists }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Artists</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
      {artists.map((artist, index) => (
        <PlaylistCard
          key={index}
          title={artist.title}
          type={artist.type}
          imageUrl={artist.imageUrl}
        />
      ))}
    </div>
  </div>
);

const PlaylistsGrid = ({ playlists }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Playlists</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
      {playlists.map((playlist, index) => (
        <PlaylistCard
          key={index}
          title={playlist.title}
          description={playlist.description}
          imageUrl={playlist.imageUrl}
        />
      ))}
    </div>
  </div>
);
