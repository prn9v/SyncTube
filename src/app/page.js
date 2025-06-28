import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Music2, Users, Headphones, ListMusic } from "lucide-react"
import { MainNav } from "@/components/main-nav"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-white z-0">
            <img
              src="/placeholder.svg?height=600&width=1200"
              alt="Music background"
              className="w-full h-full object-cover mix-blend-overlay opacity-50"
            />
          </div>

          <div className="container relative z-10 flex flex-col items-start gap-6 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Music2 className="h-10 w-10 text-green-500" />
              <h1 className="text-4xl font-bold tracking-tight text-white">SyncTune</h1>
            </div>
            <h2 className=" text-white text-5xl font-bold tracking-tighter max-w-3xl">
              Listen to music together, <span className="text-green-500">perfectly in sync</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Create groups, join sessions, and enjoy synchronized music with friends, no matter where they are.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full bg-green-500">
                <Link href="/auth/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 justify-center  bg-black text-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How SyncTune Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold">Create or Join Groups</h3>
                <p className="text-muted-foreground">Form groups of up to 4 members using unique invitation codes.</p>
              </div>

              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Headphones className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold">Synchronized Listening</h3>
                <p className="text-muted-foreground">
                  Listen to the same music at the same time, controlled by the group admin.
                </p>
              </div>

              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <ListMusic className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold">Manage Playlists</h3>
                <p className="text-muted-foreground">
                  Create and manage personal playlists for both private and group sessions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-black text-white">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Sync Your Music?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of music lovers who are already enjoying synchronized listening experiences.
            </p>
            <Button asChild size="lg" className="rounded-full bg-green-500 text-white">
              <Link href="/register">Sign Up Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 bg-black text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Music2 className="h-6 w-6 text-green-500" />
              <span className="text-lg font-bold">SyncTune</span>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-white">
                About
              </Link>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">© 2023 SyncTune. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
