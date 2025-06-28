'use client'
import Link from "next/link";
import { ChevronLeft, ChevronRight, Music2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from 'next-auth/react'

export function MainNav() {
  return (
    <div className=" bg-black flex items-center justify-between py-4 px-6">
      <div className="flex items-center gap-2">
        <Music2 className="h-6 w-6 text-green-500" />
        <h1 className="text-xl font-bold tracking-tight text-white">
          SyncTune
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-white hover:bg-transparent"
        >
          Premium
        </Button>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-white hover:bg-transparent"
        >
          Support
        </Button>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-white hover:bg-transparent"
        >
          Download
        </Button>
        <div className="h-6 w-px bg-border"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href="/dashboard" className="w-full">
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/profile" className="w-full">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button type="button" onClick={() => signOut()} className="w-full text-left">Log out</button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
