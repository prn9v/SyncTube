'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, Pause, Heart, Share2, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import MusicPlayer from '@/components/MusicPlayer';
import SongTable from '@/components/SongTable';
import LoadingSpinner from '@/components/LoadingSpinner';

function isMongoObjectId(id) {
  return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);
}

const PlaylistDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const playlistId = params?.id;

  const [isPlaying, setIsPlaying] = useState(false);
  const [likedSongs, setLikedSongs] = useState(new Set([1, 3, 5]));
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlistData, setPlaylistData] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isMongoObjectId(playlistId)) {
          // Fetch from your database
          const response = await fetch('/api/playlist/by-ids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [playlistId] })
          });
          if (!response.ok) throw new Error('Failed to fetch playlist');
          const data = await response.json();
          if (data.playlists && data.playlists.length > 0) {
            setPlaylistData(data.playlists[0]);
            setSongs(data.playlists[0].songs || []);
          } else {
            setError('Playlist not found');
          }
        } else {
          // Fetch from Spotify API
          const response = await fetch(`/api/spotify/playlist/${playlistId}`);
          if (!response.ok) throw new Error('Failed to fetch Spotify playlist');
          const data = await response.json();
          setPlaylistData({
            playlistName: data.name,
            description: data.description,
            coverUrl: data.images?.[0]?.url,
            owner: data.owner?.display_name,
          });
          setSongs(
            (data.tracks?.items || []).map(item => {
              const track = item.track;
              return {
                id: track.id,
                title: track.name,
                artist: track.artists.map(a => a.name).join(', '),
                album: track.album?.name,
                duration: track.duration_ms,
                albumArt: track.album?.images?.[0]?.url,
                spotifyUrl: track.external_urls?.spotify,
              };
            })
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (playlistId) fetchPlaylist();
  }, [playlistId]);

  const handlePlay = () => {
    setIsPlaying((prev) => !prev);
    toast.success(isPlaying ? 'Paused' : 'Playing playlist');
  };

  const handleLike = (songId) => {
    const newLikedSongs = new Set(likedSongs);
    if (newLikedSongs.has(songId)) {
      newLikedSongs.delete(songId);
      toast.success('Removed from liked songs');
    } else {
      newLikedSongs.add(songId);
      toast.success('Added to liked songs');
    }
    setLikedSongs(newLikedSongs);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Playlist link copied to clipboard');
  };

  return (
    <div className="flex h-screen bg-spotify-black overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pb-24 px-0 sm:px-2 md:px-4">
        {/* Header */}
        <div className="relative">
          <div className="bg-gradient-to-b from-green-500 via-green-800 to-spotify-black">
            <div className="px-2 sm:px-6 pt-6 pb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/playlist')}
                className="text-white hover:text-white hover:bg-black/20 mb-6"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>

              {loading ? (
                <LoadingSpinner />
              ) : error ? (
                <div className="text-red-400">{error}</div>
              ) : playlistData ? (
                <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                  <div className="flex-shrink-0 mb-4 md:mb-0">
                    <img
                      src={playlistData.coverUrl || playlistData.coverImage || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop'}
                      alt={playlistData.playlistName || playlistData.name}
                      className="w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-lg object-cover shadow-2xl"
                    />
                  </div>
                  <div className="flex-1 text-white text-center md:text-left">
                    <p className="text-xs sm:text-sm font-medium mb-2">PLAYLIST</p>
                    <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-2 sm:mb-4 leading-tight">{playlistData.playlistName || playlistData.name}</h1>
                    <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-2 sm:mb-4 max-w-2xl mx-auto md:mx-0">{playlistData.description}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-1 sm:gap-2 text-xs sm:text-sm">
                      <span className="font-medium">
                        {
                          playlistData.creator ||
                          (typeof playlistData.owner === 'object' && (playlistData.owner.name || playlistData.owner.email)) ||
                          (typeof playlistData.owner === 'string' && playlistData.owner) ||
                          'Unknown'
                        }
                      </span>
                      <span className="hidden sm:inline text-gray-400">•</span>
                      <span className="text-gray-400">{songs.length} songs</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-2 sm:px-6 py-4 sm:py-6 bg-gradient-to-b from-black/20 to-spotify-black">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Button
              onClick={handlePlay}
              className="w-14 h-14 rounded-full bg-spotify-green hover:bg-green-400 hover:scale-105 transition-all shadow-lg"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-black" />
              ) : (
                <Play className="h-6 w-6 text-black ml-1" />
              )}
            </Button>

            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-white">
              <Heart className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="w-8 h-8 text-gray-400 hover:text-white"
            >
              <Share2 className="h-6 w-6" />
            </Button>

            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-white">
              <MoreHorizontal className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Song Table */}
        <div className="px-2 sm:px-4 md:px-6 overflow-x-auto">
          <SongTable
            songs={songs}
            likedSongs={likedSongs}
            onLike={handleLike}
            showAddedDate={isMongoObjectId(playlistId)}
            onTrackSelect={setCurrentTrack}
          />
        </div>
      </main>

      <MusicPlayer track={currentTrack} />
    </div>
  );
};

export default PlaylistDetailPage;
