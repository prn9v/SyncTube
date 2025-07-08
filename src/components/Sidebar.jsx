"use client";
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
  Menu,
  X,
} from "lucide-react";
import { AvatarImage } from "@radix-ui/react-avatar";

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [groups, setGroups] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false); // <-- for mobile

  const isActive = (path) => pathname === path;

  // Fetch groups
  useEffect(() => {
    async function fetchGroups() {
      if (Array.isArray(session?.user?.groups) && session.user.groups.length > 0) {
        try {
          const res = await fetch("/api/group/by-ids", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: session.user.groups }),
          });
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          setGroups(Array.isArray(data.groups) ? data.groups : []);
        } catch (error) {
          setGroups([]);
        }
      } else {
        setGroups([]);
      }
    }
    if (session) fetchGroups();
  }, [session]);

  // Fetch playlists
  useEffect(() => {
    async function fetchPlaylists() {
      if (Array.isArray(session?.user?.playlists) && session.user.playlists.length > 0) {
        try {
          const res = await fetch("/api/playlist/by-ids", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: session.user.playlists }),
          });
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
    if (session) fetchPlaylists();
  }, [session]);

  const SidebarContent = (
    <div
      className={`bg-black h-full flex flex-col pb-28 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button 
          onClick={() => router.push("/dashboard")} 
          className="bg-black cursor-pointer hover:bg-green-500"
          variant="ghost"
        >
          <Music className="h-8 w-8 text-green-500" />
          {!collapsed && (
            <h1 className="font-bold text-xl text-white ml-2">SyncTune</h1>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:inline-flex text-gray-400 hover:text-white hover:bg-green-500"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-white"
        >
          <X />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="px-2 space-y-1">
        {[{ icon: Home, label: "Home", path: "/dashboard" }, { icon: Search, label: "Search", path: "/search" }].map(item => (
          <Button
            key={item.path}
            variant="ghost"
            className={`w-full justify-start ${
              isActive(item.path)
                ? "bg-gray-600 text-white hover:bg-green-500"
                : "text-gray-400 hover:text-white hover:bg-green-500"
            }`}
            onClick={() => {
              router.push(item.path);
              setMobileOpen(false);
            }}
          >
            <item.icon className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`} />
            {!collapsed && item.label}
          </Button>
        ))}
      </nav>

      <Separator className="my-4" />

      {/* Actions */}
      <nav className="px-2 space-y-1">
        {[{ icon: PlusCircle, label: "Create Playlist", path: "/create-playlist" }, { icon: Heart, label: "Liked Songs", path: "/likedSongs" }].map(item => (
          <Button
            key={item.path}
            variant="ghost"
            className={`w-full justify-start ${
              isActive(item.path)
                ? "bg-gray-600 text-white hover:bg-green-500"
                : "text-gray-400 hover:text-white hover:bg-green-500"
            }`}
            onClick={() => {
              router.push(item.path);
              setMobileOpen(false);
            }}
          >
            <item.icon className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`} />
            {!collapsed && item.label}
          </Button>
        ))}
      </nav>

      {/* Scrollable Section */}
      {!collapsed && (
        <div className="flex-1 overflow-auto mt-4 px-2">
          {/* Groups */}
          <div className="px-2 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">Your Groups</h3>
              <Users className="h-4 w-4 text-white" />
            </div>
            {groups.length > 0 ? (
              groups.map((group, idx) => (
                <Button
                  key={group._id || idx}
                  variant="ghost"
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-green-500"
                  onClick={() => {
                    router.push(`/group-session/${group.inviteCode}`);
                    setMobileOpen(false);
                  }}
                >
                  <Users className="h-4 w-4 mr-3 text-white" />
                  {group.groupName}
                </Button>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center">No groups yet</p>
            )}
          </div>

          {/* Playlists */}
          <Separator className="my-4" />
          <div className="px-2">
            <h3 className="text-sm font-semibold text-white mb-2">Your Playlists</h3>
            {playlists.length > 0 ? (
              playlists.map((playlist, idx) => (
                <Button
                  key={playlist._id || idx}
                  variant="ghost"
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-green-500"
                  onClick={() => {
                    router.push(`/playlist/${playlist._id}`);
                    setMobileOpen(false);
                  }}
                >
                  {playlist.coverUrl && (
                    <img
                      src={playlist.coverUrl}
                      alt={playlist.playlistName}
                      className="w-7 h-7 rounded object-cover mr-2"
                    />
                  )}
                  {playlist.playlistName || "Untitled Playlist"}
                </Button>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center">No playlists yet</p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="mt-auto px-2 py-4">
        <Separator className="my-4" />
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-green-500"
          onClick={() => {
            router.push("/profile");
            setMobileOpen(false);
          }}
        >
          <Settings className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`} />
          {!collapsed && "My Profile"}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-green-500"
          onClick={() => signOut()}
        >
          <LogOut className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`} />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed z-[60] top-0 left-0 h-full transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:flex`}
      >
        {SidebarContent}
      </div>

      {/* Hamburger Menu Button (visible only on mobile) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="fixed z-[60] top-4 left-4 text-white md:hidden bg-black bg-opacity-60 rounded-full"
      >
        <Menu />
      </Button>
    </>
  );
}
