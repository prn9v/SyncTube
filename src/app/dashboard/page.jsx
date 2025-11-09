"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import PlaylistCard from "@/components/PlaylistCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Search,
  Plus,
  ArrowRight,
  Users,
  Play,
  User,
  Music,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession } from "next-auth/react";
import { useSpotifyTopTracks } from "@/hooks/useSpotifyTopTracks";
import { useSpotifyTopArtists } from "@/hooks/useSpotifyTopArtists";
import axios from "axios";

const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTrack, setCurrentTrack] = useState(null);
  const { topTracks, loading, error } = useSpotifyTopTracks();
  const {
    topArtists,
    loading: artistsLoading,
    error: artistsError,
  } = useSpotifyTopArtists();
  const [group, setGroup] = useState([]);

  const fallbackTracks = [
    {
      title: "The Weeknd",
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
      type: "artist",
    },
    {
      title: "Taylor Swift",
      imageUrl:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
      type: "artist",
    },
    {
      title: "Drake",
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
      type: "artist",
    },
    {
      title: "Dua Lipa",
      imageUrl:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
      type: "artist",
    },
    {
      title: "Bad Bunny",
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
      type: "artist",
    },
  ];
  // Fallback data for artists in case Spotify API fails
  const fallbackArtists = [
    {
      title: "Ed Sheeran",
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
      type: "artist",
    },
    {
      title: "Ariana Grande",
      imageUrl:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
      type: "artist",
    },
    {
      title: "Post Malone",
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
      type: "artist",
    },
    {
      title: "Billie Eilish",
      imageUrl:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
      type: "artist",
    },
    {
      title: "Kendrick Lamar",
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
      type: "artist",
    },
  ];

  useEffect(() => {
    async function fetchGroups() {
      if (
        Array.isArray(session?.user?.groups) &&
        session.user.groups.length > 0
      ) {
        try {
          const { data } = await axios.post("/api/group/by-ids", {
            ids: session.user.groups,
          });

          setGroup(Array.isArray(data.groups) ? data.groups : []);
        } catch (error) {
          console.error("Error fetching groups:", error);
          setGroup([]);
          toast.error("Failed to load groups");
        }
      } else {
        setGroup([]);
      }
    }

    if (session) fetchGroups();
  }, [session]);

  const handleCreateGroup = async () => {
    const groupName = window.prompt("Enter a name for your group:");
    if (!groupName || !groupName.trim()) return;

    const groupCode = "SYNCR" + Math.floor(1000 + Math.random() * 9000);

    try {
      const { data } = await axios.post("/api/group/create", {
        groupName: groupName.trim(),
        groupCode,
        owner: session.user.id || session.user._id,
      });

      toast.success("Group created! Share code: " + groupCode);
      router.push(`/group-session/${groupCode}`);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.error || "Failed to create group");
    }
  };

  const handleJoinGroup = async () => {
    const code = window.prompt("Enter the group code to join:");
    if (!code || !code.trim()) return;

    try {
      const userId = session.user.id || session.user._id;

      const { data } = await axios.put(`/api/group/${code.trim()}`, {
        groupCode: code.trim(),
        userId,
      });

      if (data.groupId) {
        toast.success("Joined group successfully!");
        router.push(`/group-session/${code.trim()}`);
      } else {
        toast.error(data.error || "Failed to join group");
      }
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error(
        error.response?.data?.error ||
          "An error occurred while joining the group."
      );
    }
  };

  // Format duration from milliseconds to MM:SS
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  // Use Spotify tracks if available, otherwise use fallback
  const displayTracks = topTracks.length > 0 ? topTracks : fallbackTracks;

  // Use Spotify artists if available, otherwise use fallback
  const displayArtists = topArtists.length > 0 ? topArtists : fallbackArtists;

  // Handle track selection
  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
  };

  return (
    <ProtectedRoute>
      <div className="bg-black min-h-screen flex flex-col">
        <div className="flex flex-col md:flex-row flex-1 bg-black text-white overflow-hidden">
          <div className="w-full md:w-64 flex-shrink-0">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-y-auto pb-24 pt-4 px-2 sm:px-4 md:px-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Good afternoon</h1>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-gray-700 text-white cursor-pointer"
                  onClick={() => router.push("/search")}
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-green-500 text-black cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => router.push("/profile")}
                >
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className=" bg-gradient-to-r from-gray-600 to-black rounded-lg p-4 sm:p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
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
                  {group.map((group, index) => (
                    <div
                      key={group._id}
                      className="flex items-center gap-3 bg-black text-white rounded-lg p-3 min-w-max cursor-pointer hover:bg-opacity-80"
                      onClick={() =>
                        router.push(`/group-session/${group.inviteCode}`)
                      }
                    >
                      <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                        <Users className="h-6 w-6 text-black " />
                      </div>
                      <div>
                        <p className="font-medium">{group.groupName}</p>
                        <p className="text-xs text-gray-400">
                          {group.lastActive}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 cursor-pointer"
                      >
                        <Play className="h-4 w-4 cursor-pointer" />
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center leading-tight gap-2">
                  <Music className="h-5 w-5 text-green-500" />
                  {loading ? "Loading Top Tracks..." : "TOP TRACKS"}
                </h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-700 rounded-lg h-48 mb-3"></div>
                      <div className="bg-gray-700 h-4 rounded mb-2"></div>
                      <div className="bg-gray-600 h-3 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {displayTracks.map((track, index) => (
                    <PlaylistCard
                      key={track.id || index}
                      title={track.title}
                      description={track.description}
                      imageUrl={track.imageUrl}
                      duration={
                        track.duration_ms
                          ? formatDuration(track.duration_ms)
                          : undefined
                      }
                      previewUrl={track.preview_url}
                      uri={track.uri}
                      onTrackSelect={handleTrackSelect}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-8 mb-4">
              <h2 className="text-2xl font-bold flex items-center leading-tight gap-2">
                <Music className="h-5 w-5 text-green-500" />
                {loading ? "Loading Top Artist..." : "TOP ARTIST"}
              </h2>
            </div>

            <div className="mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {displayArtists.map((artist, index) => (
                  <PlaylistCard
                    id={artist.id}
                    key={index}
                    title={artist.title}
                    type={artist.type}
                    imageUrl={artist.imageUrl}
                    onTrackSelect={handleTrackSelect}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
        <MusicPlayer track={currentTrack} />
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
