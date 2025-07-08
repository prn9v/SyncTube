"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import GroupSessionControl from "@/components/GroupSessionControl";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

const GroupSession = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const params = useParams();
  const groupId = params?.id;
  const { data: session } = useSession();

  useEffect(() => {
    const fetchGroupAndCheckAdmin = async () => {
      if (!groupId || !session?.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch group data
        const response = await fetch(`/api/group/${groupId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch group');
        }
        
        const data = await response.json();
        setGroup(data.group);
        
        // Check if current user is the admin
        const currentUserId = session.user._id || session.user.id;
        const isUserAdmin = data.group.admin === currentUserId;
        setIsAdmin(isUserAdmin);
        
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupAndCheckAdmin();
  }, [groupId, session]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="bg-black min-h-screen flex flex-col">
          <div className="flex flex-col md:flex-row flex-1 bg-black text-white overflow-hidden">
            <div className="w-full md:w-64 flex-shrink-0">
              <Sidebar />
            </div>
            <main className="flex-1 overflow-y-auto pb-24 pt-4 px-2 sm:px-4 md:px-6">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-spotify-offwhite">Loading group session...</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!group) {
    return (
      <ProtectedRoute>
        <div className="bg-black min-h-screen flex flex-col">
          <div className="flex flex-col md:flex-row flex-1 bg-black text-white overflow-hidden">
            <div className="w-full md:w-64 flex-shrink-0">
              <Sidebar />
            </div>
            <main className="flex-1 overflow-y-auto pb-24 pt-4 px-2 sm:px-4 md:px-6">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-red-400 text-xl mb-2">Group not found</p>
                  <p className="text-spotify-offwhite">The group you're looking for doesn't exist or you don't have access to it.</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-black min-h-screen flex flex-col">
        <div className="flex flex-col md:flex-row flex-1 bg-black text-white overflow-hidden">
          <div className="w-full md:w-64 flex-shrink-0">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-y-auto pb-24 pt-4 px-2 sm:px-4 md:px-6">
            <div className="mb-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span className="text-green-400">Group: {group.groupName}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isAdmin 
                  ? 'bg-green-500 text-black' 
                  : 'bg-gray-600 text-white'
              }`}>
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
            <GroupSessionControl 
              isAdmin={isAdmin} 
              groupId={groupId} 
              currentTrack={currentTrack}
              setCurrentTrack={setCurrentTrack}
            />
          </main>
        </div>
        <MusicPlayer 
          inGroup={true} 
          isAdmin={isAdmin} 
          groupId={groupId} 
          track={currentTrack}
        />
      </div>
    </ProtectedRoute>
  );
};

export default GroupSession;
