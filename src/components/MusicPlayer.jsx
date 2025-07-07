'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Heart,
  ListMusic,
  UserPlus,
  Share2,
  Shuffle,
  ChevronUp,
  ChevronDown,
  Music,
} from "lucide-react";
import { useSession } from 'next-auth/react';

const MusicPlayer = ({ inGroup = false, isAdmin = false, track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0); 
  const [volume, setVolume] = useState(70);
  const [liked, setLiked] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { data: session } = useSession();


  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Update duration when track changes
  useEffect(() => {
    setDuration(0);
    if (track?.duration_ms) {
      setDuration(Math.floor(track.duration_ms / 1000)); // Convert ms to seconds
    }

    if(track.duration){
      setDuration(Math.floor(track.duration))
    }
  }, [track]);

  // Check if current track is liked when track changes
  useEffect(() => {
    if (track && session) {
      checkIfLiked();
    } else {
      setLiked(false);
    }
  }, [track, session]);

  const checkIfLiked = async () => {
    if (!track || !session) return;

    try {
      const songData = getSongDataForAPI();
      const response = await fetch('/api/user/check-liked', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songData, userId: session.user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
      }
    } catch (error) {
      console.error('Error checking if song is liked:', error);
    }
  };

  const getSongDataForAPI = () => {
    if (!track) return null;

    // Handle different track structures
    if (track.title && track.artist) {
      return {
        title: track.title,
        artist: track.artist,
        album: track.album || null,
        duration: track.duration || null,
        albumArt: track.albumArt || null,
        spotifyId: track.spotifyId || null,
      };
    }

    if (track.name && track.artists) {
      return {
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album?.name || null,
        duration: track.duration_ms ? Math.floor(track.duration_ms / 1000) : null,
        albumArt: track.album?.images?.[0]?.url || null,
        spotifyId: track.id || null,
      };
    }

    return {
      title: track.name || track.title || 'Unknown Track',
      artist: track.artist || 'Unknown Artist',
      album: track.album || null,
      duration: track.duration || null,
      albumArt: track.albumArt || null,
      spotifyId: track.spotifyId || null,
    };
  };

  const handleLikeToggle = async () => {
    if (!track || !session || isLiking) return;
    console.log("track: ",track);
    console.log("session: ",session);
    console.log("isLiking: ",isLiking);

    setIsLiking(true);
    try {
      const songData = getSongDataForAPI();
      console.log("song data: ",songData);
      const endpoint = liked ? '/api/user/unlike-song' : '/api/user/like-song';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songData , userId: session.user.id }),
      });

      if (response.ok) {
        setLiked(!liked);
      } else {
        console.error('Failed to toggle like status');
      }
    } catch (error) {
      console.error('Error toggling like status:', error);
    } finally {
      setIsLiking(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isPlaying && !minimized) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, minimized]);

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Helper function to get track info safely
  const getTrackInfo = () => {
    if (!track) {
      return {
        name: inGroup ? "No track selected" : "No track selected",
        artist: inGroup ? "Select a track from the queue" : "Select a track to play",
        imageUrl: null,
      };
    }

    // Handle queue song structure (from group sessions)
    if (track.title && track.artist) {
      return {
        name: track.title,
        artist: track.artist,
        imageUrl: track.albumArt || null,
      };
    }

    // Handle Spotify API track structure
    if (track.album?.images) {
      return {
        name: track.name || "Unknown Track",
        artist: track.artists?.map(artist => artist.name).join(', ') || "Unknown Artist",
        imageUrl: track.album.images[0]?.url || null,
      };
    }

    // Handle legacy track structure
    if (track.image && Array.isArray(track.image)) {
      return {
        name: track.name || "Unknown Track",
        artist: track.artist || "Unknown Artist",
        imageUrl: track.image[0] || null,
      };
    }

    // Fallback
    return {
      name: track.name || track.title || "Unknown Track",
      artist: track.artist || "Unknown Artist",
      imageUrl: track.albumArt || null,
    };
  };

  const trackInfo = getTrackInfo();

  if (!hasMounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-800 to-black border-t border-gray-700 transition-all duration-300 ">
      {/* Minimized Bar */}
      {minimized ? (
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3 text-white">
            <Play className="h-4 w-4" />
            <span className="text-sm font-medium truncate">
              {trackInfo.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => setMinimized(false)}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Song Info */}
          <div className="flex items-center w-full md:w-1/3 gap-4">
            <div className="h-14 w-14 bg-gray-500 rounded-md overflow-hidden flex-shrink-0">
              {trackInfo.imageUrl ? (
                <img
                  src={trackInfo.imageUrl}
                  alt="Album cover"
                  className="object-cover h-full w-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Music className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">
                {trackInfo.name}
              </p>
              <p className="text-sm text-gray-400 truncate">{trackInfo.artist}</p>
            </div>
            {/* Only show like button if track is selected and user is logged in */}
            {track && session && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLikeToggle}
                disabled={isLiking}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart
                  className={`h-5 w-5 transition-all duration-200 ${
                    liked 
                      ? "fill-red-500 text-red-500 scale-110" 
                      : "hover:scale-110"
                  }`}
                />
              </Button>
            )}
          </div>

          {/* Playback Controls */}
          <div className="flex flex-col items-center w-full md:w-1/3">
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="text-gray-400">
                <Shuffle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400">
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="rounded-full bg-white hover:text-gray-400 text-black h-10 w-10 flex items-center justify-center"
                disabled={!track}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400">
                <SkipForward className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400">
                <ListMusic className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex w-full items-center gap-2 mt-1">
              <span className="text-xs text-gray-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={(val) => {
                  if (isAdmin || !inGroup) {
                    setCurrentTime(val[0]);
                  }
                }}
                className={`${
                  !isAdmin && inGroup
                    ? "opacity-70 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              />
              <span className="text-xs text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center justify-end w-full md:w-1/3 gap-2">
            {inGroup && (
              <>
                <div className="flex items-center bg-gray-700 rounded-full px-3 py-1">
                  <UserPlus className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-xs font-medium text-white">
                    In Group • {isAdmin ? "Admin" : "Member"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-white"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </>
            )}
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-gray-400" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(val) => setVolume(val[0])}
                className="w-20 md:w-32 text-green-500"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => setMinimized(true)}
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
