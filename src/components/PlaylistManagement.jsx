'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import MyPlaylistsTab from './MyPlaylistsTab';
import SongLibraryTab from './SongLibraryTab';
import LikedSongsTab from './LikedSongsTab';

const PlaylistManagement = () => {
  const [activeTab, setActiveTab] = useState("my-playlists");

  return (
    <div className=" bg-black text-white flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Music</h2>
        <Button
          className="bg-green-500 hover:bg-opacity-80 gap-2"
          onClick={() => toast.success('Create new playlist dialog would open')}
        >
          <Plus className="h-4 w-4" />
          Create Playlist
        </Button>
      </div>

      <Tabs
        defaultValue="my-playlists"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full "
      >
        <TabsList className="grid grid-cols-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:bg-gray-800 mb-4 w-full ">
          <TabsTrigger value="my-playlists" className="font-semibold text-green-500 text-sm cursor-pointer">My Playlists</TabsTrigger>
          <TabsTrigger value="song-library" className="font-semibold text-green-500 text-sm cursor-pointer">Song Library</TabsTrigger>
          <TabsTrigger value="liked-songs" className="font-semibold text-green-500 text-sm cursor-pointer">Liked Songs</TabsTrigger>
        </TabsList>

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
