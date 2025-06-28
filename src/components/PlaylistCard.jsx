"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

const PlaylistCard = ({
  title,
  description = "",
  imageUrl = "https://via.placeholder.com/200?text=Playlist",
  type = "playlist",
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handlePlay = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleClick = () => {
    const path = `/${type}/${title.replace(/\s+/g, "-").toLowerCase()}`;
    router.push(path);
  };

  return (
    <Card
      className="bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:bg-gray-800 transition-colors duration-300 cursor-pointer relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
    >
      <div className="p-4 flex flex-col gap-4">
        <div className="relative">
          <img
            src={imageUrl}
            alt={title}
            className={`w-full aspect-square object-cover ${
              type === "artist" ? "rounded-full" : "rounded-md"
            } shadow-md`}
          />
          {hasMounted && isHovering && (
            <Button
              className={`absolute bottom-2 right-2 rounded-full bg-green-500 hover:bg-opacity-80 shadow-lg w-12 h-12 flex items-center justify-center transition-opacity duration-200 ${
                isHovering ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              onClick={handlePlay}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-black" />
              ) : (
                <Play className="h-6 w-6 text-black ml-0.5" />
              )}
            </Button>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="font-bold truncate">{title}</h3>
          {description && (
            <p className="text-sm text-gray-300 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PlaylistCard;
