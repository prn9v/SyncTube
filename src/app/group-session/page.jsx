"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import GroupSessionControl from "@/components/GroupSessionControl";
import ProtectedRoute from "@/components/ProtectedRoute";

const GroupSession = () => {
  const [isAdmin] = useState(true);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-black text-white overflow-hidden">
        <Sidebar />

        <main className="flex-1  overflow-y-auto pb-24 pt-4 px-6">
          <GroupSessionControl isAdmin={isAdmin} />
        </main>

        <MusicPlayer inGroup={true} isAdmin={isAdmin} />
      </div>
    </ProtectedRoute>
  );
};

export default GroupSession;
