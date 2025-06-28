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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // User data from session or fallback
  const user = {
    id: session?.user?.id,
    name: session?.user?.name ,
    username: session?.user?.username ,
    email: session?.user?.email || "alex.johnson@example.com",
    bio: session?.user?.bio || "",
    location: session?.user?.location || "",
    joinDate: session?.expires || "",
    avatar: session?.user?.image || "/placeholder.svg?height=120&width=120",
    coverImage: "/placeholder.svg?height=200&width=800",
    isVerified: true,
    isPremium: true,
  };

  const stats = {
    totalPlaylists: session?.user?.playlists || 0,
    totalGroups: session?.user?.groups || 0,
    totalListeningTime: "2,847 hours",
    favoriteGenre: "Indie Rock",
    songsLiked: session?.user?.likedSongs || 0,
    groupsCreated: session?.user?.groups || 0,
  };

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

  const userPlaylists = (session?.user?.playlists && Array.isArray(session.user.playlists))
    ? session.user.playlists
    : [];

  // Map userGroups to match GroupSession model for rendering
  const userGroups = (session?.user?.groups && Array.isArray(session.user.groups))
    ? session.user.groups.map(group => ({
        id: group._id,
        name: group.inviteCode || "Group",
        members: Array.isArray(group.members) ? group.members.length : 0,
        role: group.admin === session?.user?.id ? "Admin" : "Member",
        image: "/placeholder.svg?height=80&width=80",
        isActive: !!group.nowPlaying,
      }))
    : [];

  const achievements = [
    {
      id: 1,
      title: "Playlist Master",
      description: "Created 20+ playlists",
      icon: Music,
      earned: true,
    },
    {
      id: 2,
      title: "Group Leader",
      description: "Created 3+ groups",
      icon: Crown,
      earned: true,
    },
    {
      id: 3,
      title: "Music Explorer",
      description: "Listened to 100+ different artists",
      icon: Star,
      earned: true,
    },
    {
      id: 4,
      title: "Night Owl",
      description: "Listen to music after midnight 50+ times",
      icon: Activity,
      earned: false,
    },
  ];

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
                            className="gap-2 bg-black text-white hover:bg-gray-800 hover:text-white transition-all duration-300 hover:scale-105"
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
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="name" className="text-right">
                                Name
                              </Label>
                              <Input
                                id="name"
                                defaultValue={user.name}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="username" className="text-right">
                                Username
                              </Label>
                              <Input
                                id="username"
                                defaultValue={user.username}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="bio" className="text-right">
                                Bio
                              </Label>
                              <Textarea
                                id="bio"
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
                                defaultValue={user.location}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              onClick={() => setIsEditingProfile(false)}
                            >
                              Save changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        className="bg-black text-white hover:bg-gray-800 hover:text-white transition-all duration-300 hover:scale-105"
                      >
                        Share Profile
                      </Button>
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
                  <Tabs defaultValue="overview" className="mt-8">
                    <TabsList className="mb-6 px-4 bg-gray-800">
                      <TabsTrigger
                        value="overview"
                        className="text-white data-[state=active]:text-black"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger
                        value="playlists"
                        className="text-white data-[state=active]:text-black"
                      >
                        Playlists
                      </TabsTrigger>
                      <TabsTrigger
                        value="groups"
                        className="text-white data-[state=active]:text-black"
                      >
                        Groups
                      </TabsTrigger>
                      <TabsTrigger
                        value="achievements"
                        className="text-white data-[state=active]:text-black"
                      >
                        Recommended Playlist
                      </TabsTrigger>
                      <TabsTrigger
                        value="settings"
                        className="text-white data-[state=active]:text-black"
                      >
                        Settings
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <Card className="bg-black border-0 hover:bg-gray-900 transition-all duration-300">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                              <Activity className="h-5 w-5" />
                              Recent Activity
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {recentActivity.map((activity, index) => (
                                <div
                                  key={activity.id}
                                  className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded-md transition-all duration-300"
                                  style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <activity.icon className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-white">
                                      {activity.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {activity.time}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Top Stats */}
                        <Card className="bg-black border-0 hover:bg-gray-900 transition-all duration-300">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                              <Trophy className="h-5 w-5" />
                              Your Stats
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-white">
                                  Favorite Genre
                                </span>
                                <Badge variant="secondary">
                                  {stats.favoriteGenre}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-white">
                                  Groups Created
                                </span>
                                <span className="font-semibold text-white">
                                  {stats.groupsCreated}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-white">
                                  Followers
                                </span>
                                <span className="font-semibold text-white">
                                  {stats.totalFollowers}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-white">
                                  Following
                                </span>
                                <span className="font-semibold text-white">
                                  {stats.totalFollowing}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="playlists">
                      {userPlaylists.length === 0 ? (
                        <div className="text-green-400 text-2xl text-center py-12">NO PLAYLIST AVAILABLE. PLEASE CREATE PLAYLIST.</div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {userPlaylists.map((playlist, index) => (
                            <Card
                              key={playlist.id}
                              className="bg-black hover:bg-gray-900 transition-all duration-300 border-0 overflow-hidden group hover:scale-105"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <CardContent className="p-4">
                                <div className="relative aspect-square mb-3 rounded-md overflow-hidden">
                                  <img
                                    src={playlist.image || "/placeholder.svg"}
                                    alt={playlist.title}
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
                                      {playlist.title}
                                    </h3>
                                    <p className="text-xs text-gray-300 truncate">
                                      {playlist.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {playlist.songCount} songs
                                    </p>
                                  </div>
                                  <Badge
                                    variant={
                                      playlist.isPublic ? "default" : "secondary"
                                    }
                                    className="ml-2 text-xs"
                                  >
                                    {playlist.isPublic ? "Public" : "Private"}
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
                        {userGroups.map((group, index) => (
                          <Card
                            key={group.id}
                            className="bg-black border-0 hover:bg-gray-900 transition-all duration-300 hover:scale-102"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <img
                                    src={group.image || "/placeholder.svg"}
                                    alt={group.name}
                                    className="h-12 w-12 rounded-md object-cover hover:scale-110 transition-transform"
                                  />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-white">
                                        {group.name}
                                      </h3>
                                      {group.role === "Admin" && (
                                        <Crown className="h-4 w-4 text-yellow-500" />
                                      )}
                                      {group.isActive && (
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-300">
                                      {group.members} members • {group.role}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:scale-105 transition-transform bg-black text-green-400 border-gray-600 hover:bg-gray-800 hover:text-white"
                                  >
                                    {group.isActive
                                      ? "Join Session"
                                      : "View Group"}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="achievements">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {achievements.map((achievement, index) => (
                          <Card
                            key={achievement.id}
                            className={`border-0 hover:scale-105 transition-all duration-300 ${
                              achievement.earned
                                ? "bg-primary/10 border-primary/20 hover:bg-primary/20"
                                : "bg-gray-900 hover:bg-gray-800"
                            }`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    achievement.earned
                                      ? "bg-primary/20 text-primary"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  <achievement.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-white">
                                    {achievement.title}
                                  </h3>
                                  <p className="text-sm text-gray-300">
                                    {achievement.description}
                                  </p>
                                </div>
                                {achievement.earned && (
                                  <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse">
                                    Earned
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                      <Card className="bg-black border-0 hover:bg-gray-900 transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-white">
                            <User className="h-5 w-5" />
                            Account Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="email" className="text-white">
                                Email
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                defaultValue={user.email}
                                className="bg-gray-800 border-gray-700 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="language" className="text-white">
                                Language
                              </Label>
                              <Select defaultValue="en">
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="es">Spanish</SelectItem>
                                  <SelectItem value="fr">French</SelectItem>
                                  <SelectItem value="de">German</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-black border-0 hover:bg-gray-900 transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-white">
                            <Bell className="h-5 w-5" />
                            Notifications
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">
                                Group Invitations
                              </div>
                              <div className="text-sm text-gray-300">
                                Get notified when someone invites you to a group
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Separator className="bg-gray-700" />
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">
                                New Followers
                              </div>
                              <div className="text-sm text-gray-300">
                                Get notified when someone follows you
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Separator className="bg-gray-700" />
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">
                                Playlist Updates
                              </div>
                              <div className="text-sm text-gray-300">
                                Get notified about updates to shared playlists
                              </div>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-black border-0 hover:bg-gray-900 transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-white">
                            <Volume2 className="h-5 w-5" />
                            Audio Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-white">Audio Quality</Label>
                            <Select defaultValue="high">
                              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">
                                  Low (96 kbps)
                                </SelectItem>
                                <SelectItem value="normal">
                                  Normal (160 kbps)
                                </SelectItem>
                                <SelectItem value="high">
                                  High (320 kbps)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Separator className="bg-gray-700" />
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">
                                Crossfade
                              </div>
                              <div className="text-sm text-gray-300">
                                Smooth transition between songs
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Separator className="bg-gray-700" />
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">
                                Normalize Volume
                              </div>
                              <div className="text-sm text-gray-300">
                                Set the same volume level for all tracks
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-black border-0 hover:bg-gray-900 transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-white">
                            <Shield className="h-5 w-5" />
                            Privacy Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">
                                Public Profile
                              </div>
                              <div className="text-sm text-gray-300">
                                Allow others to see your profile and activity
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Separator className="bg-gray-700" />
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">
                                Show Listening Activity
                              </div>
                              <div className="text-sm text-gray-300">
                                Let friends see what you're currently listening
                                to
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Separator className="bg-gray-700" />
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">
                                Allow Group Invitations
                              </div>
                              <div className="text-sm text-gray-700">
                                Let anyone invite you to groups
                              </div>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>
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
