"use client"; // Add this for App Router
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
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
  const [groups,setGroups] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

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
          setGroups(Array.isArray(data.groups) ? data.groups : []);
        } catch (error) {
          setGroups([]);
        }
      } else {
        setGroups([]);
      }
    }
    
    if (session) {
      fetchGroups();
    }
  }, [session]);

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
          setPlaylists(Array.isArray(data.playlists) ? data.playlists : []);
        } catch (error) {
          setPlaylists([]);
        } finally {
          setLoading(false);
        }
      } else {
        setPlaylists([]);
      }
    }
    
    if (session) {
      fetchPlaylists();
    }
  }, [session]);




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
          <Button 
            onClick={() => router.push("/dashboard")} 
            className="bg-black cursor-pointer hover:bg-green-500"
            variant="ghost"
          >
            {!collapsed && <Music className="h-8 w-8 text-green-500" />}
            {!collapsed && (
              <h1 className="font-bold text-xl text-white ml-2">SyncTune</h1>
            )}
            {collapsed && <Music className="h-8 w-8 text-green-500" />}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="cursor-pointer text-gray-400 hover:text-white hover:bg-green-500"
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

      {/* Scrollable Content */}
      {!collapsed && (
        <>
          <Separator className="my-4" />
          <div className="flex-1 overflow-auto scroll-hide">
            {/* Groups */}
            <div className="px-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-white">
                  Your Groups
                </h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="px-2">
              {groups.length > 0 ? (
                <ul className="space-y-1 pb-2">
                  {groups.map((group, idx) => (
                    <li key={group._id || group.groupName || idx}>
                      <Button
                        variant="ghost"
                        className={`cursor-pointer w-full justify-start ${
                          group.active
                            ? "bg-gray-600 text-white hover:bg-green-500"
                            : "text-gray-400 hover:text-white hover:bg-green-500"
                        }`}
                        onClick={() => router.push(`/group-session/${group.inviteCode}`)}
                      >
                        <Users className="h-4 w-4 mr-3 text-white" />
                         {group.groupName}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-gray-400">
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
                    <li key={playlist._id || playlist.id || playlist.name || idx}>
                      <Button
                        variant="ghost"
                        className="w-full cursor-pointer justify-start text-gray-400 hover:text-white hover:bg-green-500 flex items-center gap-2"
                        onClick={() => router.push(`/playlist/${playlist._id || playlist.id}`)}
                      >
                        {playlist.coverUrl && (
                          <img
                            src={playlist.coverUrl}
                            alt={playlist.playlistName || playlist.title || 'Playlist Cover'}
                            className="w-7 h-7 rounded object-cover mr-2"
                            style={{ minWidth: 28, minHeight: 28 }}
                          />
                        )}
                        {typeof playlist === 'string' 
                          ? playlist 
                          : playlist.playlistName || playlist.title || 'Untitled Playlist'
                        }
                      </Button>
                    </li>
                  ))}
                </>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-sm">No playlists yet</p>
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
          <Settings className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`} />
          {!collapsed && "My Profile"}
        </Button>

        <Button
          variant="ghost"
          className="w-full cursor-pointer justify-start text-gray-400 hover:text-white hover:bg-green-500"
          onClick={() => signOut()}
        >
          <LogOut className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`} />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  );
}