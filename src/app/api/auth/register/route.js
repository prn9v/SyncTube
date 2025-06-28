import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

export async function POST(req) {
  try {
    const { firstName, lastName, username, email, password } = await req.json()


    // Basic validation
    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Username validation (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    // Create user
    const client = await clientPromise
    const db = client.db()
    
    // Check if user already exists (email or username)
    const existingUser = await db.collection('users').findOne({ 
      $or: [{ email }, { username }] 
    })
    
    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      } else if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        )
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create user document
    const userDoc = {
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`, // For NextAuth compatibility
      emailVerified: null, // For NextAuth compatibility
      image: null, // For NextAuth compatibility
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    // Insert user into database
    const result = await db.collection('users').insertOne(userDoc)
    
    // Create response user object (without password)
    const user = {
      id: result.insertedId.toString(),
      firstName,
      lastName,
      username,
      email,
      name: `${firstName} ${lastName}`,
      createdAt: userDoc.createdAt
    }

    return NextResponse.json(
      { 
        message: 'User created successfully', 
        user 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}