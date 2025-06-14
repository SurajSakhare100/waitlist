import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Waitlist from '@/models/Waitlist'
import Submission from '@/models/Submission'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's waitlists
    const waitlists = await Waitlist.find({ userId: user._id }).sort({ createdAt: -1 })
    
    // Get submission counts for each waitlist
    const waitlistsWithCounts = await Promise.all(
      waitlists.map(async (waitlist) => {
        const submissionCount = await Submission.countDocuments({ waitlistId: waitlist._id })
        return {
          ...waitlist.toObject(),
          submissionCount,
        }
      })
    )

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
      },
      waitlists: waitlistsWithCounts,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}