"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, ExternalLink } from "lucide-react";

const PlaylistCard = ({
  id,
  title,
  description = "",
  imageUrl,
  type = "playlist",
  duration,
  previewUrl,
  uri,
  onTrackSelect
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  console.log("id: ",id);
  console.log("type: ",type);

  useEffect(() => {
    setHasMounted(true);
  }, []);


  const handleClick = () => {
    if (type === "artist" && id) {
      router.push(`/artist/${id}`);
      return;
    }
    if (onTrackSelect) {
      // Create track object with available data
      const trackData = {
        title: title,
        artist: description || "Unknown Artist",
        album: type === "artist" ? "Artist" : "Unknown Album",
        duration: duration,
        albumArt: imageUrl,
        spotifyId: uri,
        previewUrl: previewUrl,
        type: type
      };
      onTrackSelect(trackData);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  

  return (
    <Card
      className="bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:bg-gray-800 transition-colors duration-300 cursor-pointer relative group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
    >
      <div className="p-4 flex flex-col gap-4">
        <div className="relative">
          <Image
            src={imageUrl}
            alt={title}
            width={320}
            height={320}
            className={`w-full aspect-square ${
              type === "artist" ? "rounded-full" : "rounded-md"
            } shadow-md object-cover`}
            onError={handleImageError}
            priority={true}
            unoptimized={true}
          />
          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-md flex items-center justify-center">
            <Button
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-500 hover:bg-green-600 text-black cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {duration}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="font-bold truncate">{title}</h3>
          {description && (
            <p className="text-sm text-gray-300 line-clamp-2">{description}</p>
          )}
          {type === "artist" && (
            <span className="inline-block mt-2 text-xs text-green-400 bg-green-900 bg-opacity-30 px-2 py-1 rounded">
              Artist
            </span>
          )}
          
        </div>
      </div>
    </Card>
  );
};

export default PlaylistCard;
