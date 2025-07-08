'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Music, Clock, Loader2, RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react'
import { useRouter } from "next/navigation";
import LoadingSpinner from '@/components/LoadingSpinner';

const LikedSongsTab = ({ setActiveTab, refreshTrigger, onTrackSelect }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    
    if (session && session.user) {
      // First try to use session data directly
      const sessionLikedSongs = Array.isArray(session.user.likedSongs) ? session.user.likedSongs : [];
      
      if (sessionLikedSongs.length > 0) {
        // If we have liked songs in session, fetch their details
        fetchLikedSongsDetails(sessionLikedSongs);
      } else {
        // If no liked songs in session, try to fetch from API
        fetchLikedSongsFromAPI();
      }
    } else if (status === 'unauthenticated') {
      setLoading(false);
      setLikedSongs([]);
    } else if (status === 'loading') {
      setLoading(true);
    } else {
      setLoading(false);
      setError('User session not properly loaded');
    }
  }, [session, status, refreshTrigger]);

  const fetchLikedSongsDetails = async (songIds) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user/liked-songs');
      
      if (response.ok) {
        const data = await response.json();
        setLikedSongs(data.songs || []);
      } else {
        // Fallback to session data if API fails
        setLikedSongs(songIds);
      }
    } catch (error) {
      console.error('Error fetching liked songs details:', error);
      // Fallback to session data
      setLikedSongs(songIds);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedSongsFromAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user/liked-songs');
      
      if (response.ok) {
        const data = await response.json();
        setLikedSongs(data.songs || []);
      } else {
        setError('Failed to fetch liked songs');
      }
    } catch (error) {
      console.error('Error fetching liked songs from API:', error);
      setError('Failed to fetch liked songs');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '-';
    
    // If duration is in seconds (number)
    if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // If duration is already formatted as string
    if (typeof duration === 'string') {
      return duration;
    }
    
    return '-';
  };

  // Helper function to get song display info
  const getSongDisplayInfo = (song) => {
    if (typeof song === 'string') {
      // If song is just an ID string, return basic info
      return {
        id: song,
        title: 'Song ID: ' + song.substring(0, 8) + '...',
        artist: 'Unknown Artist',
        album: '-',
        duration: '-',
        albumArt: null
      };
    }
    
    // If song is an object with full details
    return {
      id: song._id || song.id,
      title: song.title || song.name || 'Unknown Title',
      artist: song.artist || 'Unknown Artist',
      album: song.album || '-',
      duration: song.duration || '-',
      albumArt: song.albumArt || null
    };
  };

  if (status === 'loading' || loading) {
    return <LoadingSpinner />;
  }

  if (!session || !session.user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to view your liked songs</p>
          <Button
            variant="outline"
            className="bg-black border-white text-white hover:bg-green-600 hover:text-white"
            onClick={() => router.push('/auth/login')}
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full pr-1 scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-200 overflow-y-scroll space-y-4" style={{ scrollbarGutter: 'stable' }}>
      <div className="bg-gradient-to-r from-green-500/20 to-green-400 p-8 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-40 w-40 bg-gradient-to-br from-spotify-green to-emerald-400 rounded-lg shadow-lg flex items-center justify-center">
              <Heart className="h-20 w-20 text-white" />
            </div>
            <div>
              <p className="uppercase text-xs font-semibold text-spotify-offwhite">Playlist</p>
              <h2 className="text-5xl font-bold mt-2 mb-4">Liked Songs</h2>
              <p className="text-spotify-offwhite">
                {likedSongs.length} song{likedSongs.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchLikedSongsFromAPI}
            disabled={loading}
            className="text-white hover:text-green-400"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="bg-spotify-light rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="sticky top-0 bg-spotify-light border-b border-spotify-dark z-10">
            <tr className="text-left text-spotify-offwhite">
              <th className="p-4 w-10">#</th>
              <th className="p-4">Title</th>
              <th className="p-4">Album</th>
              <th className="p-4 text-right">
                <Clock className="h-4 w-4 inline" />
              </th>
            </tr>
          </thead>
          <tbody>
            {likedSongs.map((song, index) => {
              const songInfo = getSongDisplayInfo(song);
              return (
                <tr
                  key={songInfo.id || index}
                  className="border-b border-spotify-dark hover:bg-spotify-dark transition-colors cursor-pointer"
                  onClick={() => {
                    if (onTrackSelect) onTrackSelect(songInfo);
                  }}
                >
                  <td className="p-4 text-spotify-offwhite">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-spotify-dark rounded flex-shrink-0 overflow-hidden">
                        {songInfo.albumArt ? (
                          <img 
                            src={songInfo.albumArt} 
                            alt="Album cover" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music className="h-6 w-6 m-2 text-spotify-offwhite" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{songInfo.title}</p>
                        <p className="text-sm text-spotify-offwhite">{songInfo.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-spotify-offwhite">{songInfo.album}</td>
                  <td className="p-4 text-right text-spotify-offwhite">
                    {formatDuration(songInfo.duration)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {likedSongs.length === 0 && !error && (
          <div className="py-10 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No liked songs yet</p>
            <p className="text-sm text-gray-500 mb-4">Start liking songs to see them here</p>
            <Button
              variant="outline"
              className="mt-4 bg-black border-white text-white hover:bg-green-600 hover:text-white cursor-pointer"
              onClick={() => router.push('/search')}
            >
              Search For Songs
            </Button>
          </div>
        )}

        {error && (
          <div className="py-10 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              variant="outline"
              className="bg-black border-white text-white hover:bg-green-600 hover:text-white"
              onClick={fetchLikedSongsFromAPI}
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongsTab;
