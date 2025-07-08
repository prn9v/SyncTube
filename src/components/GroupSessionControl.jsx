"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  UserPlus, Copy, Plus, X, Music, Crown, Users,
  MessageCircle, Play, Trash2
} from "lucide-react";
import { useSession } from "next-auth/react";
import SpotifySearch from './SpotifySearch';

export default function GroupSessionControl({ isAdmin, groupId, currentTrack, setCurrentTrack }) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
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
        const res = await fetch(`/api/group/${groupId}`);
        if (!res.ok) throw new Error("Failed to fetch group");

        const data = await res.json();
        setGroup(data.group);

        if (Array.isArray(data.group?.messages)) {
          setMessages(
            data.group.messages.map(msg => ({
              sender: msg.sender._id === session?.user?._id ? "You" : msg.sender,
              content: msg.content,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            }))
          );
        }

        if (Array.isArray(data.group?.members)) {
          setListenerStatus({
            online: data.group.members.length,
            total: data.group.members.length,
          });
        }
      } catch (err) {
        setGroup(null);
      } finally {
        setLoading(false);
      }
    }

    if (groupId && session?.user) fetchGroup();
  }, [groupId, session?.user]);

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
        body: JSON.stringify({ sender: session?.user, content: chatMessage })
      });
      if (!res.ok) throw new Error();

      const data = await res.json();
      setMessages(
        data.messages.map(msg => ({
          sender: msg.sender._id === session?.user?._id ? "You" : msg.sender,
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }))
      );
      setChatMessage("");
    } catch {
      toast.error("Failed to send message");
    }
  }, [chatMessage, groupId, session?.user]);

  const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const refreshGroup = useCallback(async () => {
    try {
      const res = await fetch(`/api/group/${groupId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGroup(data.group);
    } catch {}
  }, [groupId]);

  const removeSong = useCallback(async (song) => {
    if (!isAdmin) return toast.error("Only the admin can remove songs");
    try {
      const res = await fetch(`/api/group/${groupId}/remove-song`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song })
      });
      if (!res.ok) throw new Error();
      toast.success("Song removed from queue");
      refreshGroup();
    } catch {
      toast.error("Failed to remove song");
    }
  }, [isAdmin, groupId, refreshGroup]);

  if (loading) return <div className="flex items-center justify-center h-full p-10"><p>Loading group session...</p></div>;
  if (!group) return <div className="flex items-center justify-center h-full p-10"><p>Error loading group session.</p></div>;

  return (
    <div className="flex flex-col px-4 sm:px-6 lg:px-8 py-4 w-full h-full space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-green-500" />
          {group.groupName || "Group Session"}
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Group Details and Now Playing Section */}
        <div className="xl:col-span-2 space-y-4">
          {/* Group Members */}
          <Card className="bg-gray-800 text-white">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Members</h3>
                <Badge className="bg-green-500 text-white">{listenerStatus.online}/{listenerStatus.total} online</Badge>
              </div>
              {group.members?.length > 0 ? group.members.map((member) => (
                <div key={member._id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback className="bg-green-500 text-white">{member.name.charAt(0)}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-gray-400">@{member.username}</p>
                      <p className="text-xs text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  {isAdmin && group.admin !== member._id && (
                    <Button variant="ghost" size="icon" className="hover:text-red-500">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )) : <p className="text-gray-400">No members found.</p>}
              {group.members?.length < 4 && (
                <Button variant="outline" className="w-full" onClick={copyInviteCode}>
                  <UserPlus className="mr-2 w-4 h-4" />
                  Invite Friends ({4 - group.members.length} slots left)
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Now Playing & Queue */}
          <Card className="bg-gray-800 text-white">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Now Playing</h3>
                <Badge variant="secondary" className="bg-gray-700">Group Session</Badge>
              </div>
              {/* Song queue will go here */}
              {/* Add song button */}
              {isAdmin && (
                <div>
                  <Button className="w-full mt-4 bg-green-500 hover:bg-green-600" onClick={() => setShowSpotifySearch(true)}>
                    <Plus className="mr-2 w-4 h-4" />
                    Add Songs to Queue
                  </Button>
                  {showSpotifySearch && <SpotifySearch isAdmin={true} groupId={group.inviteCode} onSongAdded={refreshGroup} />}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Invite & Chat Section */}
        <div className="space-y-4">
          <Card className="bg-gray-800 text-white">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Invite Friends</h3>
                <Button variant="ghost" size="icon" onClick={copyInviteCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-xs">Group Code</p>
                <p className="font-mono text-xl font-bold">{groupId}</p>
              </div>
              <Button className="w-full bg-green-500 hover:bg-green-600" onClick={copyInviteCode}>Copy Invite Code</Button>
            </CardContent>
          </Card>

          {/* Group Chat */}
          <Card className="bg-gray-800 text-white h-[300px] flex flex-col">
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <Button variant="ghost" className="text-white" onClick={() => setShowChat(!showChat)}>
                  <MessageCircle className="w-5 h-5 mr-2" /> Group Chat
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
                    <div className={`rounded px-3 py-2 ${msg.sender === "You" ? "bg-green-500 text-white" : "bg-gray-700 text-white"}`}>
                      {msg.sender !== "You" && msg.sender !== "System" && <p className="text-xs font-bold">{msg.sender.name}</p>}
                      <p>{msg.content}</p>
                      <p className="text-xs text-right opacity-70">{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input placeholder="Type a message..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} className="bg-gray-700 text-white" />
                <Button type="submit" className="bg-green-500">Send</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
