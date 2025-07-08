'use client'

import Link from "next/link";
import { ChevronLeft, ChevronRight, Music2, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MainNav() {
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-black px-4 py-3 flex items-center justify-between sm:px-6">
      {/* Logo + Title */}
      <div className="flex items-center gap-2">
        <Music2 className="h-6 w-6 text-green-500" />
        <h1 className="text-xl font-bold tracking-tight text-white">SyncTune</h1>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-4">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-white hover:bg-transparent"
          onClick={() => router.push('/dashboard')}
        >
          Dashboard
        </Button>

        <div className="h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => router.push('/profile')}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || "/placeholder.svg?height=32&width=32"} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black border border-gray-700">
            <DropdownMenuItem
              onClick={() => {
                router.push('/dashboard');
                setMenuOpen(false);
              }}
              className="text-white"
            >
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem
              onClick={() => {
                router.push('/profile');
                setMenuOpen(false);
              }}
              className="text-white"
            >
              Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
