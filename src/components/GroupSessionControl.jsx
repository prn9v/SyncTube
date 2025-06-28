"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  UserPlus, Copy, Plus, X, Music, Settings,
  Crown, Users, MessageCircle
} from "lucide-react";

export default function GroupSessionControl({ isAdmin = true }) {
  const [inviteCode, setInviteCode] = useState("SYNCR1346");
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([
    { sender: "System", content: "Welcome to the group session!", timestamp: new Date() },
    { sender: "Alex", content: "Hey everyone! Ready for some music?", timestamp: new Date(Date.now() - 60000) },
  ]);
  const [listenerStatus] = useState({ online: 3, total: 4 });

  const members = [
    { id: 1, name: "You", avatar: null, isAdmin: true, online: true },
    { id: 2, name: "Alex", avatar: "https://via.placeholder.com/40", isAdmin: false, online: true },
    { id: 3, name: "Taylor", avatar: "https://via.placeholder.com/40", isAdmin: false, online: true },
    { id: 4, name: "Jordan", avatar: "https://via.placeholder.com/40", isAdmin: false, online: false },
  ];

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success("Invite code copied to clipboard");
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setMessages(prev => [...prev, { sender: "You", content: chatMessage, timestamp: new Date() }]);
    setChatMessage("");

    setTimeout(() => {
      setMessages(prev => [...prev, { sender: "Alex", content: "Cool! I like this song too!", timestamp: new Date() }]);
    }, 2000);
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full ">
      <div className="flex items-center  justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-green-500" />
          Family Group Session
        </h2>
        {isAdmin && (
          <Button variant="outline" className="gap-2 bg-black border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
            <Settings className="h-4 w-4" />
            Manage Group
          </Button>
        )}
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
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          {member.avatar ? (
                            <AvatarImage src={member.avatar} alt={member.name} />
                          ) : (
                            <AvatarFallback className="bg-green-500 text-white">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {member.isAdmin && (
                          <span className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                            <Crown className="h-3 w-3 text-black" />
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-gray-400">
                          {member.online ? "Active now" : "Offline"}
                        </p>
                      </div>
                    </div>

                    {isAdmin && member.id !== 1 && (
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-green-500 hover:text-white">
                        <X className="h-4 w-4 " />
                      </Button>
                    )}
                  </div>
                ))}

                {members.length < 4 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-dashed border-spotify-offwhite text-spotify-offwhite hover:text-white"
                    onClick={copyInviteCode}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Friends ({4 - members.length} slots left)
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

              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-spotify-dark rounded-md relative overflow-hidden">
                  <img src="https://via.placeholder.com/64" alt="Album cover" className="object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <Music className="h-8 w-8 text-white animate-pulse-green" />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Never Gonna Give You Up</h4>
                  <p className="text-sm text-gray-400">Rick Astley</p>
                  <p className="text-xs text-green-500 mt-1">
                    {isAdmin ? "You are controlling playback" : "Admin is controlling playback"}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Queue Management</h3>
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Songs to Queue
                  </Button>
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
                <p className="font-mono font-bold text-xl tracking-widest">{inviteCode}</p>
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
                  className="p-0 h-auto text-lg font-semibold hover:bg-transparent"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
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
                        <p className="text-xs font-bold">{msg.sender}</p>
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
                  className="bg-spotify-dark border-spotify-light"
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
