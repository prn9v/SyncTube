"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  UserPlus,
  Copy,
  Plus,
  X,
  MessageCircle,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import SpotifySearch from "./SpotifySearch";
import LoadingSpinner from "./LoadingSpinner";

export default function GroupSessionControl({
  isAdmin,
  groupId,
  currentTrack,
  setCurrentTrack,
}) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "System",
      content: "Welcome to the group session!",
      timestamp: new Date(),
    },
  ]);
  const [listenerStatus, setListenerStatus] = useState({ online: 0, total: 0 });
  const [showSpotifySearch, setShowSpotifySearch] = useState(false);

  useEffect(() => {
    async function fetchGroup() {
      if (!groupId || !session?.user) return;

      try {
        setLoading(true);

        const { data } = await axios.get(`/api/group/${groupId}`);
        if (!data?.group) throw new Error("Group not found");

        setGroup(data.group);

        // Load messages
        if (Array.isArray(data.group.messages)) {
          setMessages(
            data.group.messages.map((msg) => ({
              sender: msg.sender._id === session.user._id ? "You" : msg.sender,
              content: msg.content,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            }))
          );
        }

        // Members
        if (Array.isArray(data.group.members)) {
          setListenerStatus({
            online: data.group.members.length,
            total: data.group.members.length,
          });
        }
      } catch (err) {
        console.error("Error fetching group:", err);
        setGroup(null);
        toast.error("Failed to load group details");
      } finally {
        setLoading(false);
      }
    }

    fetchGroup();
  }, [groupId, session?.user]);

  // ✅ Copy Invite Code
  const copyInviteCode = useCallback(() => {
    navigator.clipboard.writeText(groupId);
    toast.success("Invite code copied to clipboard!");
  }, [groupId]);

  // ✅ Send Message
  const sendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (!chatMessage.trim()) return;

      try {
        const { data } = await axios.post(`/api/group/${groupId}`, {
          sender: session.user,
          content: chatMessage,
        });

        if (Array.isArray(data.messages)) {
          setMessages(
            data.messages.map((msg) => ({
              sender: msg.sender._id === session.user._id ? "You" : msg.sender,
              content: msg.content,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            }))
          );
        }

        setChatMessage("");
      } catch (err) {
        console.error("Error sending message:", err);
        toast.error("Failed to send message");
      }
    },
    [chatMessage, groupId, session?.user]
  );

  // ✅ Refresh Group (for updates)
  const refreshGroup = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/group/${groupId}`);
      setGroup(data.group);
    } catch (err) {
      console.error("Error refreshing group:", err);
    }
  }, [groupId]);

  // ✅ Remove Song (Admin only)
  const removeSong = useCallback(
    async (song) => {
      if (!isAdmin) return toast.error("Only the admin can remove songs");

      try {
        await axios.delete(`/api/group/${groupId}/remove-song`, {
          data: { song },
        });

        toast.success("Song removed from queue");
        refreshGroup();
      } catch (err) {
        console.error("Error removing song:", err);
        toast.error("Failed to remove song");
      }
    },
    [isAdmin, groupId, refreshGroup]
  );

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (loading)
    return (
      <div className="flex items-center justify-center h-full p-10">
        <LoadingSpinner />
      </div>
    );

  if (!group)
    return (
      <div className="flex items-center justify-center h-full p-10">
        <p>Error loading group session.</p>
      </div>
    );

  return (
    <div className="flex flex-col px-4 sm:px-6 lg:px-8 py-4 w-full h-full space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-green-500" />
          {group.groupName || "Group Session"}
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left Section */}
        <div className="xl:col-span-2 space-y-4">
          {/* Members */}
          <Card className="bg-gray-800 text-white">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Members</h3>
                <Badge className="bg-green-500 text-white">
                  {listenerStatus.online}/{listenerStatus.total} online
                </Badge>
              </div>

              {group.members?.length > 0 ? (
                group.members.map((member) => (
                  <div
                    key={member._id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-green-500 text-white">
                          {member.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.username}</p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                    </div>
                    {isAdmin && group.admin !== member._id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No members found.</p>
              )}

              {group.members?.length < 4 && (
                <Button
                  className="w-full mt-4 bg-green-500 hover:bg-green-600"
                  onClick={copyInviteCode}
                >
                  <UserPlus className="mr-2 w-4 h-4" />
                  Invite Friends ({4 - group.members.length} slots left)
                </Button>
                
              )}
            </CardContent>
          </Card>

          {/* Now Playing / Queue */}
          <Card className="bg-gray-800 text-white">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Now Playing</h3>
                <Badge variant="secondary" className="bg-gray-700">
                  Group Session
                </Badge>
              </div>

              {isAdmin && (
                <div>
                  <Button
                    className="w-full mt-4 bg-green-500 hover:bg-green-600"
                    onClick={() => setShowSpotifySearch(true)}
                  >
                    <Plus className="mr-2 w-4 h-4" />
                    Add Songs to Queue
                  </Button>

                  {showSpotifySearch && (
                    <SpotifySearch
                      isAdmin={true}
                      groupId={group.inviteCode}
                      onSongAdded={refreshGroup}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Section (Invite + Chat) */}
        <div className="space-y-4">
          {/* Invite */}
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
              <Button
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={copyInviteCode}
              >
                Copy Invite Code
              </Button>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="bg-gray-800 text-white h-[300px] flex flex-col">
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <Button
                  variant="ghost"
                  className="text-white"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> Group Chat
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.sender === "You"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded px-3 py-2 ${
                        msg.sender === "You"
                          ? "bg-green-500 text-white"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {msg.sender !== "You" &&
                        msg.sender !== "System" && (
                          <p className="text-xs font-bold">
                            {msg.sender.name}
                          </p>
                        )}
                      <p>{msg.content}</p>
                      <p className="text-xs text-right opacity-70">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="bg-gray-700 text-white"
                />
                <Button type="submit" className="bg-green-500">
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
