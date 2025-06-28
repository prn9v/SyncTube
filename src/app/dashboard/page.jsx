"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import PlaylistCard from "@/components/PlaylistCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Plus, ArrowRight, Users, Play, User } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession, signOut } from "next-auth/react";

const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const recentlyPlayed = [
    {
      title: "Today's Top Hits",
      description: "New music from The Weeknd",
      imageUrl: "https://via.placeholder.com/200?text=Top+Hits",
    },
    {
      title: "Workout Mix",
      description: "High energy music to keep you going",
      imageUrl: "https://via.placeholder.com/200?text=Workout",
    },
    {
      title: "Chill Vibes",
      description: "Relax and unwind",
      imageUrl: "https://via.placeholder.com/200?text=Chill",
    },
    {
      title: "Hip Hop Mix",
      description: "Latest hip hop hits",
      imageUrl: "https://via.placeholder.com/200?text=Hip+Hop",
    },
    {
      title: "80's Classics",
      description: "The best hits from the 80's",
      imageUrl: "https://via.placeholder.com/200?text=80s",
    },
  ];

  const recommendedArtists = [
    {
      title: "The Weeknd",
      imageUrl: "https://via.placeholder.com/200?text=Weeknd",
      type: "artist",
    },
    {
      title: "Taylor Swift",
      imageUrl: "https://via.placeholder.com/200?text=Swift",
      type: "artist",
    },
    {
      title: "Drake",
      imageUrl: "https://via.placeholder.com/200?text=Drake",
      type: "artist",
    },
    {
      title: "Dua Lipa",
      imageUrl: "https://via.placeholder.com/200?text=Dua",
      type: "artist",
    },
    {
      title: "Bad Bunny",
      imageUrl: "https://via.placeholder.com/200?text=Bunny",
      type: "artist",
    },
  ];

  const recentGroups = [
    {
      name: "Family Group",
      lastActive: "Active now",
      imageUrl: "https://via.placeholder.com/60?text=FG",
    },
    {
      name: "College Friends",
      lastActive: "2 days ago",
      imageUrl: "https://via.placeholder.com/60?text=CF",
    },
  ];

  const handleCreateGroup = () => {
    const groupCode = "SYNCR" + Math.floor(1000 + Math.random() * 9000);
    toast.success("Group created! Share code: " + groupCode);
    router.push("/group-session");
  };

  const handleJoinGroup = () => {
    router.push("/group-session");
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-black text-white overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto pb-24 pt-4 px-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Good afternoon</h1>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-gray-700 text-white"
                onClick={() => router.push("/search")}
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-green-500 text-black hover:scale-105 transition-transform"
                onClick={() => router.push("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className=" bg-gradient-to-r from-gray-600 to-black rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold mb-2">Group Sessions</h2>
                <p className="text-spotify-offwhite max-w-md">
                  Listen to music with friends and family in perfect sync.
                  Create a new group or join an existing one.
                </p>
              </div>
              <div className="hidden md:flex flex-col md:flex-row gap-3">
                <Button
                  variant="outline"
                  className=" bg-black border border-green-500 text-green-500 hover:bg-green-500 hover:text-white gap-2 cursor-pointer"
                  onClick={handleJoinGroup}
                >
                  <Users className="h-4 w-4" />
                  Join Group
                </Button>
                <Button
                  className="bg-green-500 hover:bg-opacity-80 text-white gap-2 cursor-pointer"
                  onClick={handleCreateGroup}
                >
                  <Plus className="h-4 w-4" />
                  Create Group
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Recent Groups</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {recentGroups.map((group, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-black text-white rounded-lg p-3 min-w-max cursor-pointer hover:bg-opacity-80"
                    onClick={() => router.push("/group-session")}
                  >
                    <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                      <Users className="h-6 w-6 text-black " />
                    </div>
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-xs text-gray-400">
                        {group.lastActive}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div
                  className="flex items-center gap-3 bg-black border border-dashed border-spotify-offwhite rounded-lg p-3 min-w-max cursor-pointer hover:bg-opacity-80"
                  onClick={handleCreateGroup}
                >
                  <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">New Group</p>
                    <p className="text-xs text-gray-400">
                      Start listening together
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 md:hidden flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-spotify-green text-spotify-green hover:bg-spotify-green hover:text-white"
                onClick={handleJoinGroup}
              >
                Join Group
              </Button>
              <Button
                className="flex-1 bg-spotify-green hover:bg-opacity-80 text-white"
                onClick={handleCreateGroup}
              >
                Create Group
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recently played</h2>
              <Button
                variant="link"
                className="text-gray-400 hover:text-white flex items-center gap-1"
                onClick={() => router.push("/library")}
              >
                See all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {recentlyPlayed.map((item, index) => (
                <PlaylistCard
                  key={index}
                  title={item.title}
                  description={item.description}
                  imageUrl={item.imageUrl}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Artists you might like</h2>
              <Button
                variant="link"
                className="text-gray-400 hover:text-white flex items-center gap-1"
              >
                See all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {recommendedArtists.map((artist, index) => (
                <PlaylistCard
                  key={index}
                  title={artist.title}
                  type={artist.type}
                  imageUrl={artist.imageUrl}
                />
              ))}
            </div>
          </div>
        </main>

        <MusicPlayer />
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
