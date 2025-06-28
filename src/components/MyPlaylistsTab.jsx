'use client'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const MyPlaylistsTab = () => {
  const mockPlaylists = [
    { id: 1, name: 'Workout Mix', trackCount: 12, coverUrl: 'https://via.placeholder.com/60' },
    { id: 2, name: 'Chill Vibes', trackCount: 25, coverUrl: 'https://via.placeholder.com/60' },
    { id: 3, name: 'Study Focus', trackCount: 18, coverUrl: 'https://via.placeholder.com/60' },
    { id: 4, name: 'Road Trip', trackCount: 30, coverUrl: 'https://via.placeholder.com/60' },
  ];

  return (
    <div className=" bg-black grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {mockPlaylists.map((playlist) => (
        <Card key={playlist.id} className="bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:bg-gray-800 transition-all cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img 
                src={playlist.coverUrl} 
                alt={playlist.name} 
                className="w-15 h-15 rounded-md shadow-md"
              />
              <div>
                <h3 className="font-bold">{playlist.name}</h3>
                <p className="text-sm text-gray-400">{playlist.trackCount} tracks</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:bg-gray-800 border-dashed border-gray-400 hover:border-white transition-all cursor-pointer flex items-center justify-center">
        <CardContent className="p-8 text-center">
          <Plus className="h-10 w-10 mx-auto mb-2 text-green-600 rounded-full bg-gray-300" />
          <p className="font-medium">Create New Playlist</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyPlaylistsTab;
