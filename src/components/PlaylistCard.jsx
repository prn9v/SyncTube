"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, ExternalLink } from "lucide-react";

const PlaylistCard = ({
  title,
  description = "",
  imageUrl,
  type = "playlist",
  duration,
  previewUrl,
  externalUrl,
  uri
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handlePlay = () => {
    if (previewUrl) {
      // Play preview audio
      const audio = new Audio(previewUrl);
      audio.play();
    } else if (externalUrl) {
      // Open in Spotify
      window.open(externalUrl, '_blank');
    }
  };

  const handleClick = () => {
    const path = `/${type}/${title.replace(/\s+/g, "-").toLowerCase()}`;
    router.push(path);
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
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-md flex items-center justify-center">
            <Button
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-500 hover:bg-green-600 text-black"
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
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
          {externalUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 p-1 h-auto text-gray-400 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                window.open(externalUrl, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PlaylistCard;
