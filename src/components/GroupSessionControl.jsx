"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  UserPlus, Copy, Plus, X, Music, Settings,
  Crown, Users, MessageCircle, Play, Trash2
} from "lucide-react";
import { useSession } from "next-auth/react";
import SpotifySearch from './SpotifySearch';

export default function GroupSessionControl({ isAdmin, groupId, currentTrack, setCurrentTrack }) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const {data: session} = useSession();
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([
    { sender: "System", content: "Welcome to the group session!", timestamp: new Date() },
  ]);
  const [listenerStatus, setListenerStatus] = useState({ online: 0, total: 0 });
  const [showSpotifySearch, setShowSpotifySearch] = useState(false);

  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await fetch(`/api/group/${groupId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setGroup(data.group);

        // Fetch messages from backend
        if (data.group && Array.isArray(data.group.messages)) {
          setMessages(
            data.group.messages.map(msg => ({
              sender: msg.sender._id === session?.user?._id ? "You" : msg.sender,
              content: msg.content,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            }))
          );
        }

        if (data.group && Array.isArray(data.group.members)) {
          setListenerStatus({
            online: data.group.members.length,
            total: data.group.members.length,
          });
        }
      } catch (error) {
        setGroup(null);
      } finally {
        setLoading(false);
      }
    }

    if (groupId && session?.user) {
      fetchGroup();
    }
  }, [groupId, session?.user?._id]);

  const copyInviteCode = useCallback(() => {
    navigator.clipboard.writeText(groupId);
    toast.success("Invite code copied to clipboard");
  }, [groupId]);

  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      const res = await fetch(`/api/group/${groupId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: session?.user, content: chatMessage }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();
      setMessages(
        data.messages.map(msg => ({
          sender: msg.sender._id === session?.user?._id ? "You" : msg.sender,
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }))
      );
      setChatMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  }, [chatMessage, groupId, session?.user]);

  const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const refreshGroup = useCallback(async () => {
    try {
      const res = await fetch(`/api/group/${groupId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGroup(data.group);
    } catch {}
  }, [groupId]);

  

  const removeSong = useCallback(async (song) => {
    if (!isAdmin) {
      toast.error("Only the admin can remove songs");
      return;
    }
    try {
      const res = await fetch(`/api/group/${groupId}/remove-song`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song }),
      });

      if (!res.ok) throw new Error("Failed to remove song");
      
      toast.success("Song removed from queue");
      refreshGroup(); // Refresh to update the queue
    } catch (error) {
      toast.error("Failed to remove song");
    }
  }, [isAdmin, groupId, refreshGroup]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading group session...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Error loading group session.</p>
      </div>
    );
  }

  const dummyUserId = group.admin;

  return (
    <div className="flex flex-col h-full ">
      <div className="flex items-center  justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-green-500" />
          {group.groupName || "Group Session"}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-r from-15% from-gray-600 to-gray-800 text-white border border-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Members</h3>
                <Badge variant="outline" className="bg-green-500 text-white">
                  {listenerStatus.online}/{listenerStatus.total} online
                </Badge>
              </div>

              <div className="space-y-3">
                {group.members && group.members.length > 0 ? (
                  group.members.map((member, idx) => (
                    <div key={member._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                              <AvatarFallback className=" h-full w-full bg-green-500 text-white text-2xl p-2">
                                {member.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                          </Avatar>
                          {group.admin === member._id && (
                            <span className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                              <Crown className="h-3 w-3 text-black" />
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-gray-400">@{member.username}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                          
                        </div>
                      </div>
                      {isAdmin && group.admin !== member._id && (
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-green-500 hover:text-white cursor-pointer">
                          <X className="h-4 w-4 cursor-pointer" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No members found.</p>
                )}

                {group.members && group.members.length < 4 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-dashed border-green-500 text-green-500 hover:text-white hover:bg-green-500 cursor-pointer"
                    onClick={copyInviteCode}
                  >
                    <UserPlus className="h-4 w-4 mr-2 text-green-500" />
                    Invite Friends ({4 - group.members.length} slots left)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-15% from-gray-600 to-gray-800 text-white border-none mt-4">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Now Playing</h3>
                <Badge variant="secondary" className="bg-gray-800 text-white">Group Session</Badge>
              </div>

              {group.queue && group.queue.length > 0 ? (       
                group.queue.map((song, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between gap-4 mb-4 p-3 rounded-lg transition-all duration-200 ${
                      currentTrack && currentTrack._id === song._id 
                        ? 'bg-green-500/20 border-2 border-green-500' 
                        : 'bg-spotify-dark'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-16 w-16 bg-spotify-dark rounded-md relative overflow-hidden">
                        <img
                          src={song.albumArt }
                          alt={song.title || "Album cover"}
                          className="object-cover w-full h-full"
                        />
                        
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{song.title || "Unknown Title"}</h4>
                        <p className="text-sm text-gray-400">{song.artist || "Unknown Artist"}</p>
                        {currentTrack && currentTrack._id === song._id && (
                          <p className="text-xs text-green-500 mt-1 font-semibold">
                            🎵 Now Playing
                          </p>
                        )}
                        {idx === 0 && !currentTrack && (
                          <p className="text-xs text-green-500 mt-1">
                            {isAdmin ? "You are controlling playback" : "Admin is controlling playback"}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                            onClick={() => setCurrentTrack(song)}
                            title="Play this song"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                            onClick={() => removeSong(song)}
                            title="Remove from queue"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {!isAdmin && (
                        <span className="text-xs text-gray-400 px-2 py-1 bg-gray-700 rounded">
                          #{idx + 1}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-4 p-3 bg-spotify-dark rounded-lg">
                  <div className="h-16 w-16 bg-spotify-dark rounded-md relative overflow-hidden">
                    <img src="https://via.placeholder.com/64" alt="Album cover" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <Music className="h-8 w-8 text-white animate-pulse-green" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">No songs in queue</h4>
                    <p className="text-sm text-gray-400">Add some songs to get started!</p>
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Queue Management</h3>
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white cursor-pointer"
                    onClick={() => setShowSpotifySearch(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Songs to Queue
                  </Button>
                  {showSpotifySearch && (
                    <div className="mt-4">
                      <SpotifySearch isAdmin={true} groupId={group.inviteCode} onSongAdded={refreshGroup} />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-gradient-to-r from-15% from-gray-600 to-gray-800 text-white border-white mb-4">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Invite Friends</h3>
                <Button variant="ghost" size="icon" onClick={copyInviteCode} className="cursor-pointer">
                  <Copy className="h-4 w-4 cursor-pointer" />
                </Button>
              </div>

              <div className="bg-spotify-dark rounded-lg p-3 text-center">
                <p className="text-xs text-spotify-offwhite mb-1">Group Code</p>
                <p className="font-mono font-bold text-xl tracking-widest">{groupId}</p>
                <p className="text-xs text-spotify-offwhite mt-2">
                  Share this code with friends to join your session
                </p>
              </div>

              <Button
                variant="default"
                className="w-full mt-4 bg-green-500 hover:bg-opacity-80 cursor-pointer"
                onClick={copyInviteCode}
              >
                Copy Invite Link
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-15% from-gray-600 to-gray-800 text-white border-white h-[300px] flex flex-col">
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-lg text-white font-semibold hover:bg-transparent"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageCircle className="h-10 w-10 mr-2" />
                  Group Chat
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto mb-2 space-y-3">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-2 ${
                        msg.sender === "System"
                          ? "bg-spotify-dark text-spotify-offwhite text-center w-full text-xs"
                          : msg.sender === "You"
                          ? "bg-green-500 text-white"
                          : "bg-gray-800 text-white"
                      }`}
                    >
                      {msg.sender !== "You" && msg.sender !== "System" && (
                        <p className="text-xs font-bold">{msg.sender.name}</p>
                      )}
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-70 text-right">{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="bg-spotify-dark border-gray-400"
                />
                <Button type="submit" className="bg-green-500 hover:bg-opacity-80">
                  Send
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
