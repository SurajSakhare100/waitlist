import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Waitlist from '@/models/Waitlist'
import { generateReferralCode } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    const data = await request.json()
    
    // Check if user has reached waitlist limit (free users get 1 waitlist)
    const existingWaitlists = await Waitlist.countDocuments({ userId: user._id })
    if (!user.isPremium && existingWaitlists >= 1) {
      return NextResponse.json(
        { message: 'Free users can create only 1 waitlist. Upgrade to Pro for unlimited waitlists.' },
        { status: 403 }
      )
    }

    // Force whiteLabel to false for free users
    if (!user.isPremium) {
      data.whiteLabel = false
    }

    // Generate embed code
    const embedCode = `<iframe src="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/embed/WAITLIST_ID" width="100%" height="400" frameborder="0"></iframe>`

    // Create waitlist
    const waitlist = await Waitlist.create({
      ...data,
      userId: user._id,
      embedCode,
      referralCode: generateReferralCode(),
    })

    return NextResponse.json({
      message: 'Waitlist created successfully',
      waitlist,
    })
  } catch (error) {
    console.error('Create waitlist error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    const waitlists = await Waitlist.find({ userId: user._id }).sort({ createdAt: -1 })

    return NextResponse.json({
      waitlists,
    })
  } catch (error) {
    console.error('Get waitlists error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}