import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

// Helper functions
export async function verifyPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    return false
  }
}

export async function getUserByEmail(email) {
  try {
    const client = await clientPromise
    const db = client.db()
    
    // Case-insensitive email search
    const user = await db.collection('users').findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    })
    
    if (!user) return null
    
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      password: user.password,
      image: user.image,
      bio: user.bio,
      likedSongs: user.likedSongs,
      location: user.location,
      createdAt: user.createdAt,
    }
  } catch (error) {
    return null
  }
}

// Define authOptions as a separate object
export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name,
          playlists: profile.playlists,
          groups: profile.groups,
          likedSongs: profile.likedSongs,
          bio: profile.bio
        }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          const user = await getUserByEmail(credentials.email)
          
          if (!user) {
            throw new Error('Invalid credentials')
          }

          const isPasswordValid = await verifyPassword(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error('Invalid credentials')
          }

          // Return user object without password
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            image: user.image,
            playlists: user.playlists,
            groups: user.groups,
            likedSongs: user.likedSongs,
            bio: user.bio,
            location: user.location,
            createdAt: user.createdAt
          }
        } catch (error) {
          throw new Error('Authentication failed')
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.username = user.username;
        token.bio = user.bio;
        token.location = user.location;
        token.createdAt = user.createdAt;
        token.likedSongs = user.likedSongs || [];
      }
      if (account?.provider === 'google' && profile) {
        token.firstName = profile.given_name;
        token.lastName = profile.family_name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.username = token.username;
        session.user.bio = token.bio || "";
        session.user.location = token.location || "";
        session.user.createdAt = token.createdAt;

        // Fetch the full user from the database to get the correct ObjectId and likedSongs
        try {
          const client = await clientPromise;
          const db = client.db();
          const dbUser = await db.collection('users').findOne({ 
            email: { $regex: new RegExp(`^${session.user.email}$`, 'i') }
          });

          // Add playlists, groups, and likedSongs to the session
          if (dbUser) {
            session.user.id = dbUser._id.toString(); // Use the actual MongoDB ObjectId
            session.user.playlists = dbUser.playlists || [];
            session.user.groups = dbUser.groups || [];
            session.user.likedSongs = dbUser.likedSongs || [];
          }
        } catch (error) {
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    signOut: '/auth/logout',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
    },
    async signOut({ session, token }) {
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}

// Create the handler
const handler = NextAuth(authOptions)

// Export GET and POST handlers
export { handler as GET, handler as POST }