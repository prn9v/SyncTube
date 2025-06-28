"use client"
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search, Music, Trash2, Heart,
  MoveRight, Clock
} from 'lucide-react';
import { toast } from 'sonner';


const SongLibraryTab = () => {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTracks, setSelectedTracks] = useState([]);

  const mockTracks = [
    { id: 1, title: 'Never Gonna Give You Up', artist: 'Rick Astley', album: 'Whenever You Need Somebody', duration: '3:32', liked: true },
    { id: 2, title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', liked: false },
    { id: 3, title: 'Shape of You', artist: 'Ed Sheeran', album: '÷', duration: '3:54', liked: true },
    { id: 4, title: 'Dance Monkey', artist: 'Tones and I', album: 'The Kids Are Coming', duration: '3:29', liked: false },
    { id: 5, title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', album: 'Uptown Special', duration: '4:30', liked: true },
    { id: 6, title: 'Someone Like You', artist: 'Adele', album: '21', duration: '4:45', liked: true },
    { id: 7, title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', album: 'VIDA', duration: '3:47', liked: false },
  ];

  const toggleTrackSelection = (trackId) => {
    setSelectedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const toggleLike = (trackId) => {
    toast.success('Track added to your liked songs');
  };

  const filteredTracks = searchQuery
    ? mockTracks.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockTracks;

  const addToPlaylist = () => {
    if (selectedTracks.length === 0) {
      toast.error('Select tracks to add to playlist');
      return;
    }
    toast.success(`${selectedTracks.length} tracks added to playlist`);
    setSelectedTracks([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search your library"
            className="pl-10 bg-spotify-dark border-spotify-light"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {selectedTracks.length > 0 && (
          <Button
            onClick={addToPlaylist}
            className="bg-spotify-green hover:bg-opacity-80 gap-2"
          >
            <MoveRight className="h-4 w-4" />
            Add to Playlist ({selectedTracks.length})
          </Button>
        )}
      </div>

      <div className="bg-spotify-light rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-spotify-dark">
            <tr className="text-left text-gray-400">
              <th className="p-4 w-10">
                <Checkbox
                  checked={selectedTracks.length === mockTracks.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTracks(mockTracks.map(track => track.id));
                    } else {
                      setSelectedTracks([]);
                    }
                  }}
                  className="data-[state=checked]:bg-spotify-green data-[state=checked]:border-spotify-green"
                />
              </th>
              <th className="p-4 w-10">#</th>
              <th className="p-4">Title</th>
              <th className="p-4">Album</th>
              <th className="p-4 text-right">
                <Clock className="h-4 w-4 inline" />
              </th>
              <th className="p-4 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filteredTracks.map((track, index) => (
              <tr
                key={track.id}
                className="border-b border-spotify-dark hover:bg-spotify-dark transition-colors"
              >
                <td className="p-4">
                  <Checkbox
                    checked={selectedTracks.includes(track.id)}
                    onCheckedChange={() => toggleTrackSelection(track.id)}
                    className="data-[state=checked]:bg-spotify-green data-[state=checked]:border-spotify-green"
                  />
                </td>
                <td className="p-4 text-spotify-offwhite">{index + 1}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-spotify-dark rounded flex-shrink-0">
                      <Music className="h-6 w-6 m-2 text-spotify-offwhite" />
                    </div>
                    <div>
                      <p className="font-medium">{track.title}</p>
                      <p className="text-sm text-spotify-offwhite">{track.artist}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-spotify-offwhite">{track.album}</td>
                <td className="p-4 text-right text-spotify-offwhite">{track.duration}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleLike(track.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${track.liked ? 'fill-spotify-green text-spotify-green' : 'text-spotify-offwhite'}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-spotify-offwhite hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTracks.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-spotify-offwhite">No tracks found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongLibraryTab;
