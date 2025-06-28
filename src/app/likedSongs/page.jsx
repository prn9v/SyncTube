"use client";

import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import ProtectedRoute from "@/components/ProtectedRoute";
import LikedSongsTab from "@/components/LikedSongsTab";

const Playlist = () => {
  return (
    <ProtectedRoute>
    <div className=" bg-black">
      <div className="flex bg-black">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col flex-1 ">
          <main className="flex-1 px-6 pt-4 bg-black text-white">
            <LikedSongsTab />
          </main>

          {/* Music Player */}
          <MusicPlayer />
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default Playlist;
