'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Heart, MoreHorizontal, Clock, TrendingUp } from 'lucide-react';

const SongTable = ({ 
  songs, 
  likedSongs = new Set(), 
  onLike, 
  showAddedDate = false, 
  showPlays = false,
  onTrackSelect
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  function formatMsToMinutes(ms) {
    if (!ms || isNaN(ms)) return '';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className="bg-spotify-black rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-spotify-dark">
            <tr className="text-left text-spotify-offwhite text-sm">
              <th className="p-4 w-12">#</th>
              <th className="p-4">Title</th>
              <th className="p-4 hidden sm:table-cell">Album</th>
              {showAddedDate && (
                <th className="p-4 hidden md:table-cell">Date added</th>
              )}
              {showPlays && (
                <th className="p-4 hidden md:table-cell">Plays</th>
              )}
              <th className="p-4 text-right w-16">
                <Clock className="h-4 w-4 inline" />
              </th>
              <th className="p-4 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song, index) => (
              <tr 
                key={song.id} 
                className="group hover:bg-spotify-light transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center justify-center w-6">
                    <span className="group-hover:hidden text-spotify-offwhite text-sm">
                      {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden group-hover:flex h-6 w-6 text-white hover:text-spotify-green"
                      onClick={() => onTrackSelect && onTrackSelect(song)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </td>

                <td className="p-4 max-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-spotify-dark rounded flex-shrink-0 overflow-hidden">
                      {song.albumArt || song.albumImage || song.image ? (
                        <img
                          src={song.albumArt || song.albumImage || song.image}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {song.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-white hover:underline cursor-pointer truncate">
                        {song.title}
                      </p>
                      <p className="text-sm text-spotify-offwhite hover:underline hover:text-white cursor-pointer truncate">
                        {song.artist}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-4 hidden sm:table-cell truncate">
                  <span className="text-spotify-offwhite hover:underline hover:text-white cursor-pointer text-sm">
                    {song.album}
                  </span>
                </td>

                {showAddedDate && (
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-spotify-offwhite text-sm">
                      {formatDate(song.addedAt)}
                    </span>
                  </td>
                )}

                {showPlays && (
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-spotify-offwhite" />
                      <span className="text-spotify-offwhite text-sm">{song.plays}</span>
                    </div>
                  </td>
                )}

                <td className="p-4 text-right">
                  <span className="text-spotify-offwhite text-sm">
                    {typeof song.duration === 'string' && song.duration.includes(':')
                      ? song.duration
                      : typeof song.duration === 'number'
                        ? formatMsToMinutes(song.duration)
                        : ''}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => onLike && onLike(song.id)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          likedSongs.has(song.id) 
                            ? 'fill-green-500 text-green-500' 
                            : 'text-gray-400 hover:bg-green-500 hover:text-white'
                        }`} 
                      />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-spotify-offwhite hover:text-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SongTable;
