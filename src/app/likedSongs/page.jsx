"use client";

import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import ProtectedRoute from "@/components/ProtectedRoute";
import LikedSongsTab from "@/components/LikedSongsTab";
import { useState } from "react";

const Playlist = () => {
  const [currentTrack, setCurrentTrack] = useState(null);

  return (
    <ProtectedRoute>
      <div className="bg-black min-h-screen flex flex-col">
        <div className="flex flex-col md:flex-row flex-1 bg-black">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="flex flex-col flex-1 min-w-0">
            <main className="flex-1 px-2 sm:px-4 md:px-6 pt-4 bg-black text-white">
              <LikedSongsTab onTrackSelect={setCurrentTrack} />
            </main>

            {/* Music Player */}
            <MusicPlayer track={currentTrack} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Playlist;
