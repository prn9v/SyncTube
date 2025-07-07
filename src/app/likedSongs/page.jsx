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
    <div className=" bg-black">
      <div className="flex bg-black">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col flex-1 ">
          <main className="flex-1 px-6 pt-4 bg-black text-white">
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
