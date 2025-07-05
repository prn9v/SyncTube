'use client'

import { Button } from "@/components/ui/button";
import { Heart, Music, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react'
import { useRouter } from "next/navigation";

const LikedSongsTab = ({ setActiveTab }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const likedTracks = Array.isArray(session?.user?.likedSongs) ? session.user.likedSongs : [];

  return (
    <div className="h-full pr-1 scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-200 overflow-y-scroll space-y-4" style={{ scrollbarGutter: 'stable' }}>
      <div className="bg-gradient-to-r from-green-500/20 to-green-400 p-8 rounded-lg">
        <div className="flex items-center gap-6">
          <div className="h-40 w-40 bg-gradient-to-br from-spotify-green to-emerald-400 rounded-lg shadow-lg flex items-center justify-center">
            <Heart className="h-20 w-20 text-white" />
          </div>
          <div>
            <p className="uppercase text-xs font-semibold text-spotify-offwhite">Playlist</p>
            <h2 className="text-5xl font-bold mt-2 mb-4">Liked Songs</h2>
            <p className="text-spotify-offwhite">
              {likedTracks.length} song{likedTracks.length !== 1 ? 's' : ''}
            </p>
          </div>
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
            {likedTracks.map((track, index) => (
              <tr
                key={track.id || index}
                className="border-b border-spotify-dark hover:bg-spotify-dark transition-colors"
              >
                <td className="p-4 text-spotify-offwhite">{index + 1}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-spotify-dark rounded flex-shrink-0">
                      <Music className="h-6 w-6 m-2 text-spotify-offwhite" />
                    </div>
                    <div>
                      <p className="font-medium">{track.title || 'Unknown Title'}</p>
                      <p className="text-sm text-spotify-offwhite">{track.artist || 'Unknown Artist'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-spotify-offwhite">{track.album || '-'}</td>
                <td className="p-4 text-right text-spotify-offwhite">{track.duration || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {likedTracks.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-gray-400">No liked songs yet</p>
            <Button
              variant="outline"
              className="mt-4 bg-black border-white text-white hover:bg-green-600 hover:text-white cursor-pointer"
              onClick={() => router.push('/search')}
            >
              Search For Songs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongsTab;
