"use client";

import { useState, useEffect } from "react";
import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Edit3,
  Music,
  Users,
  Heart,
  Play,
  Calendar,
  MapPin,
  Shield,
  Bell,
  Volume2,
  Crown,
  Trophy,
  Star,
  Activity,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession } from 'next-auth/react'
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userPlaylists,setUserPlaylists] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [userGroups, setUserGroups] = useState([]);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const router = useRouter();

  // Format join date function
  const formatJoinDate = (date) => {
    if (!date) return "Unknown";
    
    try {
      const joinDate = new Date(date);
      const year = joinDate.getFullYear().toString().slice(-2); // Get last 2 digits
      const month = joinDate.toLocaleDateString('en-US', { month: 'long' });
      const day = joinDate.getDate().toString().padStart(2, '0');
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      return "Unknown";
    }
  };

  // User data from session or fallback
  const user = {
    id: session?.user?.id,
    name: session?.user?.name,
    username: session?.user?.username,
    email: session?.user?.email || "alex.johnson@example.com",
    bio: session?.user?.bio || "",
    location: session?.user?.location || "",
    joinDate: formatJoinDate(session?.user?.createdAt),
    avatar: session?.user?.image || "/placeholder.svg?height=120&width=120",
    coverImage: "/placeholder.svg?height=200&width=800",
    isVerified: true,
    isPremium: true,
  };

  console.log("session: ",session?.user);

  console.log("user: ",user);

  const stats = {
    totalPlaylists: session?.user?.playlists.length || 0,
    totalGroups: session?.user?.groups.length || 0,
    totalListeningTime: "2,847 hours",
    favoriteGenre: "Indie Rock",
    songsLiked: session?.user?.likedSongs || 0,
    groupsCreated: session?.user?.groups || 0,
  };

  useEffect(() => {
    async function fetchPlaylists() {
      if (Array.isArray(session?.user?.playlists) && session.user.playlists.length > 0) {
        try {
          const res = await fetch("/api/playlist/by-ids", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: session.user.playlists }),
          });
          
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          
          const data = await res.json();
          setUserPlaylists(data.playlists || []);
        } catch (error) {
          setUserPlaylists([]);
        }
      } else {
        setUserPlaylists([]);
      }
    }
    
    if (session) {
      fetchPlaylists();
    }
  }, [session]);

  useEffect(() => {
    async function fetchSpotifyPlaylists() {
      try {
        const res = await fetch("/api/spotify/search?q=top&type=playlists&limit=10");
        const data = await res.json();
        setSpotifyPlaylists(data.playlists || []);
      } catch (error) {
        setSpotifyPlaylists([]);
      }
    }
    fetchSpotifyPlaylists();
  }, []);


  useEffect(() => {
    async function fetchGroups() {
      if (Array.isArray(session?.user?.groups) && session.user.groups.length > 0) {
        try {
          const res = await fetch("/api/group/by-ids", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: session.user.groups }),
          });
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          setUserGroups(data.groups || []);
        } catch (error) {
          setUserGroups([]);
        }
      } else {
        setUserGroups([]);
      }
    }
    if (session) {
      fetchGroups();
    }
  }, [session]);


  // Show first 5 songs from the first playlist as recent activity
  const recentActivity = (session?.user?.playlists && Array.isArray(session.user.playlists) && session.user.playlists[0]?.songs && Array.isArray(session.user.playlists[0].songs))
    ? session.user.playlists[0].songs.slice(0, 5).map((song, idx) => ({
        id: idx + 1,
        type: "song",
        title: `Played '${song.title || 'Unknown Title'}' by ${song.artist || 'Unknown Artist'}`,
        time: "Recently",
        icon: Music,
      }))
    : [];


  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollArea = document.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollArea) {
        setScrollY(scrollArea.scrollTop);
      }
    };

    const scrollArea = document.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollArea) {
      scrollArea.addEventListener("scroll", handleScroll);
      return () => scrollArea.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Calculate parallax and fade effects
  const parallaxOffset = scrollY * 0.5;
  const headerOpacity = Math.max(0, 1 - scrollY / 200);
  const contentTransform = `translateY(${Math.max(0, scrollY * 0.1)}px)`;

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const formData = new FormData(e.target);
      const updateData = {
        userId: session.user?.id,
        name: formData.get('name'),
        username: formData.get('username'),
        bio: formData.get('bio'),
        location: formData.get('location'),
      };

      console.log("data: ",updateData);
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setUpdateSuccess('Profile updated successfully!');
      setIsEditingProfile(false);
      
      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      setUpdateError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-black pb-12">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          <div className="flex flex-col flex-1 overflow-hidden">
            <MainNav />

            <ScrollArea className="flex-1 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-black overflow-y-scroll">
              <div className="relative">
                {/* Cover Image with Parallax */}
                <div
                  className="h-48 bg-gradient-to-r from-primary/20 to-primary/5 relative overflow-hidden"
                  style={{ transform: `translateY(${parallaxOffset}px)` }}
                >
                  <img
                    src="https://img.freepik.com/premium-photo/top-view-cameras-film-reel-piano-keyboard-yellow-surface_665346-34219.jpg?ga=GA1.1.1991852750.1729104551&semt=ais_hybrid&w=740"
                    alt="Cover"
                    className="w-full h-full object-cover opacity-30 transition-transform duration-300"
                    style={{ transform: `scale(${1 + scrollY * 0.0005})` }}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300"
                    style={{ opacity: headerOpacity }}
                  />
                </div>

                {/* Profile Header - always visible, no fade or move on scroll */}
                <div className="px-6 pb-6">
                  <div className="flex items-end gap-6 -mt-16 relative z-10">
                    <div className="relative transform transition-transform duration-300 hover:scale-105">
                      <Avatar className="h-32 w-32 border-4 border-black shadow-2xl">
                        <AvatarImage
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                        />
                        <AvatarFallback className="text-7xl bg-green-400 text-white pb-3">
                          {(user.name || "").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {user.isVerified && (
                        <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-primary rounded-full flex items-center justify-center animate-pulse">
                          <Shield className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">
                          {user.name}
                        </h1>
                        {user.isPremium && (
                          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 animate-pulse">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2">
                        @{user.username}
                      </p>
                      <p className="text-sm mb-3 max-w-2xl text-gray-200">
                        {user.bio}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {user.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Joined {user.joinDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog
                        open={isEditingProfile}
                        onOpenChange={setIsEditingProfile}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="gap-2 bg-black text-white hover:bg-gray-800 hover:text-white transition-all duration-300 hover:scale-105 cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                            <DialogDescription>
                              Make changes to your profile here. Click save when
                              you're done.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleProfileUpdate}>
                            <div className="grid gap-4 py-4">
                              {updateError && (
                                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                                  {updateError}
                                </div>
                              )}
                              {updateSuccess && (
                                <div className="text-green-500 text-sm bg-green-50 p-2 rounded">
                                  {updateSuccess}
                                </div>
                              )}
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                  Name
                                </Label>
                                <Input
                                  id="name"
                                  name="name"
                                  defaultValue={user.name}
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="username" className="text-right">
                                  Username
                                </Label>
                                <Input
                                  id="username"
                                  name="username"
                                  defaultValue={user.username}
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="bio" className="text-right">
                                  Bio
                                </Label>
                                <Textarea
                                  id="bio"
                                  name="bio"
                                  defaultValue={user.bio}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="location" className="text-right">
                                  Location
                                </Label>
                                <Input
                                  id="location"
                                  name="location"
                                  defaultValue={user.location}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditingProfile(false)}
                                disabled={isUpdating}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={isUpdating}
                              >
                                {isUpdating ? "Saving..." : "Save changes"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
                    </div>
                  </div>

                  {/* Stats with Animation */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[
                      { value: stats.totalPlaylists, label: "Playlists" },
                      { value: stats.totalGroups, label: "Groups" },
                      { value: stats.songsLiked, label: "Liked Songs" },
                      {
                        value: stats.totalListeningTime,
                        label: "Listening Time",
                      },
                    ].map((stat, index) => (
                      <Card
                        key={index}
                        className="border-0 bg-black hover:bg-gray-900 transition-all duration-300 hover:scale-105"
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl md:text-3xl font-bold text-green-400 animate-pulse">
                            {stat.value}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {stat.label}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Tabs */}
                  <Tabs defaultValue="playlists" className="mt-8">
                    <TabsList className="mb-6 px-4 bg-gray-800">
                      <TabsTrigger
                        value="playlists"
                        className="text-white data-[state=active]:text-black cursor-pointer"
                      >
                        Playlists
                      </TabsTrigger>
                      <TabsTrigger
                        value="groups"
                        className="text-white data-[state=active]:text-black cursor-pointer"
                      >
                        Groups
                      </TabsTrigger>
                      <TabsTrigger
                        value="recommened-playlist"
                        className="text-white data-[state=active]:text-black cursor-pointer"
                      >
                        Recommended Playlist
                      </TabsTrigger>
                    </TabsList>

                

                    <TabsContent value="playlists">
                      {userPlaylists.length === 0 ? (
                        <div className="text-green-400 text-2xl text-center py-12">NO PLAYLIST AVAILABLE. PLEASE CREATE PLAYLIST.</div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {userPlaylists.map((playlist, index) => (
                            <Card
                              key={playlist._id}
                              className="bg-black hover:bg-gray-900 transition-all duration-300 border-0 overflow-hidden group hover:scale-105"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <CardContent className="p-4">
                                <div className="relative aspect-square mb-3 rounded-md overflow-hidden">
                                  <img
                                    src={playlist.coverUrl || "/placeholder.svg"}
                                    alt={playlist.playlistName}
                                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                    <Button
                                      size="icon"
                                      className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12 hover:scale-110 transition-transform"
                                    >
                                      <Play className="h-6 w-6" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate text-white">
                                      {playlist?.playlistName}
                                    </h3>
                                    <p className="text-xs text-gray-300 truncate">
                                      {playlist?.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {playlist?.songs.length} songs
                                    </p>
                                  </div>
                                  <Badge
                                    variant={
                                      playlist.isPublic ? "default" : "secondary"
                                    }
                                    className="ml-2 text-xs"
                                  >
                                    {playlist?.owner?.name}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="groups">
                      <div className="space-y-4">
                        {userGroups.map((group, index) => {
                          const isAdmin = group.admin === session?.user?.id || group.owner === session?.user?.id;
                          return (
                            <Card
                              key={group._id}
                              className={`
                                relative
                                bg-gradient-to-br from-gray-900 via-black to-gray-800
                                border-0
                                shadow-lg
                                rounded-2xl
                                overflow-hidden
                                transition-all duration-300
                              
                                hover:shadow-2xl
                                group
                                before:absolute before:inset-0 before:rounded-2xl
                                before:bg-gradient-to-r before:from-green-400/30 before:to-blue-500/20
                                before:opacity-0 hover:before:opacity-100 before:transition-opacity
                              `}
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    {/* Group Avatar/Icon */}
                                    <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-green-500 via-blue-500 to-purple-500 flex items-center justify-center shadow-md border-4 border-black">
                                      <Users className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-white drop-shadow">
                                          {group.groupName || group.inviteCode || "Group"}
                                        </h3>
                                        {isAdmin && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-400 text-black text-xs font-semibold ml-1 shadow">
                                            <Crown className="h-4 w-4 mr-1" /> Admin
                                          </span>
                                        )}
                                        {group.nowPlaying && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-500 text-white text-xs font-semibold ml-1 animate-pulse shadow">
                                            <Volume2 className="h-4 w-4 mr-1" /> Now Playing
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-300 mt-1">
                                        {Array.isArray(group.members) ? group.members.length : 0} members • {isAdmin ? "Admin" : "Member"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="hover:scale-105 transition-transform bg-black text-green-400 border-gray-600 hover:bg-gray-800 hover:text-white cursor-pointer"
                                      onClick={() => router.push(`/group-session/${group.inviteCode}`)}
                                    >
                                      {group.nowPlaying ? "Join Session" : "View Group"}
                                    </Button>
                                  </div>
                                </div>

                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </TabsContent>

                    <TabsContent value="recommened-playlist">
                      <div className="max-h-108 overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-8 ">
                        {spotifyPlaylists.length > 0 ? (
                          spotifyPlaylists.map((playlist, index) => (
                            <Card
                              key={playlist.id}
                              className="bg-black hover:bg-gray-900 transition-all duration-300 border-0 overflow-hidden group text-white flex flex-row h-64 w-full"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <div className="flex-shrink-0 w-40 h-40 relative">
                                <img
                                  src={playlist.images?.[0]?.url || "/placeholder.svg"}
                                  alt={playlist.name}
                                  className="object-cover w-full h-full rounded-l-md transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                  <Button
                                    size="icon"
                                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12 hover:scale-110 transition-transform cursor-pointer"
                                    onClick={() => window.open(playlist.external_url, '_blank')}
                                  >
                                    <Play className="h-6 w-6" />
                                  </Button>
                                </div>
                              </div>
                              <CardContent className="flex flex-col justify-center flex-1 px-4 mb-20">
                                <h3 className="text-lg font-bold text-white truncate mb-1">{playlist.name}</h3>
                                <p className="text-xs text-gray-300 truncate mb-2">{playlist.description || 'No description available'}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-1">
                                  <span>By {playlist.owner}</span>
                                  <span>• {playlist.tracks_count} tracks</span>
                                </div>
                                
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-6 text-gray-400 col-span-full">
                            <p className="text-sm">No playlists found</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    
                  </Tabs>
                </div>
              </div>
            </ScrollArea>

            <MusicPlayer />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
