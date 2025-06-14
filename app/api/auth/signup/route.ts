import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { sendVerificationEmail, generateVerificationToken } from '@/lib/email'
import crypto from "crypto";
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken:token,
      verificationTokenExpiry,
    })

    // Send verification email
    await sendVerificationEmail(email, token)

    return NextResponse.json({
      message: 'User created successfully. Please check your email to verify your account.',
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}