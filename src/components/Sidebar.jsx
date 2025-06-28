"use client"; // Add this for App Router
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Search,
  Library,
  PlusCircle,
  Heart,
  Users,
  Music,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AvatarImage } from "@radix-ui/react-avatar";

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const playlists = Array.isArray(session?.user?.playlist) ? session.user.playlist : [];

  const groups = Array.isArray(session?.user?.groups) ? session.user.groups : [];

  const isActive = (path) => pathname === path;

  return (
    <div
      className={`bg-black h-[calc(100vh-84px)] flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/dashboard")} className="bg-black cursor-pointer">
            {!collapsed && <Music className="h-8 w-8 text-green-500" />}
            {!collapsed && (
              <h1 className="font-bold text-xl text-white">SyncTune</h1>
            )}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="cursor-pointer text-gray-400 hover:text-white hover:bg-green-500 hover:cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Top Nav */}
      <nav className="px-2">
        <ul className="space-y-1">
          {[
            { icon: Home, label: "Home", path: "/dashboard" },
            { icon: Search, label: "Search", path: "/search" },
          ].map((item) => (
            <li key={item.path}>
              <Button
                variant="ghost"
                className={`w-full cursor-pointer justify-start ${
                  isActive(item.path)
                    ? "bg-gray-600 text-white hover:bg-green-500"
                    : "text-gray-400 hover:text-white hover:bg-green-500"
                }`}
                onClick={() => router.push(item.path)}
              >
                <item.icon
                  className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`}
                />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Second Nav */}
      <Separator className="my-4" />
      <nav className="px-2">
        <ul className="space-y-1">
          {[
            {
              icon: PlusCircle,
              label: "Create Playlist",
              path: "/create-playlist",
            },
            { icon: Heart, label: "Liked Songs", path: "/likedSongs" },
          ].map((item) => (
            <li key={item.path}>
              <Button
                variant="ghost"
                className={`w-full cursor-pointer justify-start ${
                  isActive(item.path)
                    ? "bg-gray-400 text-white hover:bg-green-500"
                    : "text-gray-400 hover:text-white hover:bg-green-500"
                }`}
                onClick={() => router.push(item.path)}
              >
                <item.icon
                  className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`}
                />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Scrollable Content */}
      {!collapsed && (
        <>
          <Separator className="my-4" />
          <div className="flex-1 overflow-auto scroll-hide ">
            {/* Groups */}
            <div className="px-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-white">
                  Your Groups
                </h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="px-2">
              {groups.length > 0 ? (
                <ul className="space-y-1 pb-2">
                  {groups.map((group) => (
                    <li key={group.name}>
                      <Button
                        variant="ghost"
                        className={` cursor-pointer w-full justify-start ${
                          group.active
                            ? "bg-gray-400 text-white hover:bg-green-500"
                            : "text-gray-400 hover:text-white hover:bg-green-500"
                        }`}
                        onClick={() => router.push("/group-session")}
                      >
                        <Users className="h-4 w-4 mr-3" />
                        {group.name}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-white">
                  <p className="text-sm">No groups yet</p>
                  
                </div>
              )}
            </div>

            {/* Playlists */}
            <Separator className="my-4" />
            <div className="mb-2 px-4">
              <h3 className="font-semibold text-sm text-white">
                Your Playlists
              </h3>
            </div>
            <ul className="space-y-1 pb-4 px-2">
              {playlists.length > 0 ? (
                <>
                  {playlists.map((playlist, idx) => (
                    <li key={playlist.id || playlist.name || idx}>
                      <Button
                        variant="ghost"
                        className="w-full cursor-pointer justify-start text-gray-400 hover:text-white hover:bg-green-500"
                        onClick={() => router.push("/playlist")}
                      >
                        {typeof playlist === 'string' ? playlist : playlist.name || 'Untitled Playlist'}
                      </Button>
                    </li>
                  ))}
                </>
              ) : (
                <div className="text-center py-6 text-white">
                  <p className="text-sm">No Playlist yet</p>
                </div>
              )}
            </ul>
          </div>
        </>
      )}

      {/* Bottom Nav */}
      <div className="mt-auto px-2 pb-4">
        <Separator className="my-4" />

        <Button
          variant="ghost"
          className="w-full cursor-pointer justify-start text-gray-400 hover:text-white hover:bg-green-500"
          onClick={() => router.push('/profile')}
        >
          My Profile
        </Button>

        <Button
          variant="ghost"
          className="w-full cursor-pointer justify-start text-gray-400 hover:text-white hover:bg-green-500"
          onClick={() => signOut()}
        >
          Logout
        </Button>
        
      </div>
    </div>
  );
}
