"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import MyPlaylistsTab from "./MyPlaylistsTab";
import SongLibraryTab from "./SongLibraryTab";
import LikedSongsTab from "./LikedSongsTab";

const PlaylistManagement = () => {
  const [activeTab, setActiveTab] = useState("my-playlists");

  return (
    <div className="bg-black text-white flex flex-col h-full px-4 py-6 sm:px-6 md:px-10">
      {/* Header with responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Your Music</h2>
        <Button
          className="bg-green-500 hover:bg-opacity-80 gap-2 w-full sm:w-auto"
          onClick={() => toast.success("Create new playlist dialog would open")}
        >
          <Plus className="h-4 w-4" />
          Create Playlist
        </Button>
      </div>

      <Tabs
        defaultValue="my-playlists"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        {/* Responsive Tabs List */}
        <TabsList className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-800 rounded-lg text-white mb-4 w-full p-1">
          <TabsTrigger
            value="my-playlists"
            className="font-semibold text-green-500 text-sm sm:text-base p-2 rounded-md hover:bg-gray-700"
          >
            My Playlists
          </TabsTrigger>
          <TabsTrigger
            value="song-library"
            className="font-semibold text-green-500 text-sm sm:text-base p-2 rounded-md hover:bg-gray-700"
          >
            Song Library
          </TabsTrigger>
          <TabsTrigger
            value="liked-songs"
            className="font-semibold text-green-500 text-sm sm:text-base p-2 rounded-md hover:bg-gray-700"
          >
            Liked Songs
          </TabsTrigger>
        </TabsList>

        {/* Responsive Tab Content */}
        <TabsContent value="my-playlists" className="space-y-4">
          <MyPlaylistsTab setActiveTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="song-library" className="space-y-4">
          <SongLibraryTab setActiveTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="liked-songs" className="space-y-4">
          <LikedSongsTab setActiveTab={setActiveTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlaylistManagement;
