import { NextResponse } from 'next.server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    
    // Input validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Return user data WITHOUT password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ 
      message: 'Login successful', 
      user: userWithoutPassword 
    }, { status: 200 })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function verifyPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

export async function getUserByEmail(email) {
  try {
    const client = await clientPromise
    const db = client.db()
    
    const user = await db.collection('users').findOne({ email: email.toLowerCase() })
    if (!user) return null
    
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      password: user.password, // Only used for verification, removed from response
    }
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}