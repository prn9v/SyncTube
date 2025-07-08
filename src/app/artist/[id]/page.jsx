'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Play, Pause, Heart, Share2, MoreHorizontal, ArrowLeft, Users } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import MusicPlayer from '@/components/MusicPlayer';
import SongTable from '@/components/SongTable';
import LoadingSpinner from '@/components/LoadingSpinner';

const ArtistDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedSongs, setLikedSongs] = useState(new Set([2, 4, 6]));
  const [artistData, setArtistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const artistId = params.id;


  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/spotify/artists/${artistId}`);
        if (!res.ok) throw new Error('Failed to fetch artist');
        const artist = await res.json();
        setArtistData({
          id: artist.id,
          name: artist.name,
          image: artist.images?.[0]?.url,
          followers: artist.followers?.total?.toLocaleString() || '',
          verified: artist.type === 'artist',
          bio: '', // Spotify API does not provide bio
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (artistId) fetchArtist();
  }, [artistId]);

  const popularSongs = [
  ];

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    toast.success(isPlaying ? 'Paused' : 'Playing artist');
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
    toast.success('Artist link copied to clipboard');
  };

  const handleFollow = () => {
    toast.success('Following artist');
  };

  return (
    <div className="bg-spotify-black min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row flex-1 bg-spotify-black overflow-hidden">
        <div className="w-full md:w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto pb-24 px-2 sm:px-4 md:px-6">
          {/* Header */}
          <div className="relative">
            <div className="bg-gradient-to-b from-green-500 via-green-800 to-spotify-black">
              <div className="px-2 sm:px-6 pt-6 pb-8">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => router.back()}
                  className="text-white hover:text-white hover:bg-black/20 mb-6"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <div className="text-red-400">{error}</div>
                ) : artistData ? (
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                    <div className="flex-shrink-0 mb-4 md:mb-0">
                      <img 
                        src={artistData.image} 
                        alt={artistData.name}
                        className="w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-full shadow-2xl"
                      />
                    </div>
                    <div className="flex-1 text-white text-center md:text-left">
                      <p className="text-xs sm:text-sm font-medium mb-2 flex items-center gap-2 justify-center md:justify-start">
                        {artistData.verified && <span className="text-blue-400">✓</span>}
                        VERIFIED ARTIST
                      </p>
                      <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-2 sm:mb-4 leading-tight">{artistData.name}</h1>
                      <div className="flex items-center gap-2 text-xs sm:text-lg mb-2 sm:mb-4 justify-center md:justify-start">
                        <Users className="h-5 w-5" />
                        <span>{artistData.followers} followers</span>
                      </div>
                      <p className="text-gray-300 max-w-2xl mx-auto md:mx-0 text-xs sm:text-base">{artistData.bio}</p>
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
             
            </div>
          </div>

          {/* Songs */}
          <div className="px-2 sm:px-4 md:px-6">
            <h2 className="text-white text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Popular</h2>
            {popularSongs.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No songs available</div>
            ) : (
              <SongTable 
                songs={popularSongs} 
                likedSongs={likedSongs} 
                onLike={handleLike}
                showPlays
              />
            )}
          </div>
        </main>
        <MusicPlayer />
      </div>
    </div>
  );
};

export default ArtistDetail;
