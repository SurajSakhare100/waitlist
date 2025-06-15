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
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before creating a waitlist' },
        { status: 403 }
      )
    }

    // Check if user is premium or has less than 3 waitlists
    if (!user.isPremium) {
      const waitlistCount = await Waitlist.countDocuments({ userId: user._id })
      if (waitlistCount >= 3) {
        return NextResponse.json(
          { error: 'Free users can only create up to 3 waitlists. Please upgrade to Pro for unlimited waitlists.' },
          { status: 403 }
        )
      }
    }

    const { title,url, description, fields } = await request.json()
    
    // Force whiteLabel to false for free users
    // if (!user.isPremium) {
    //   data.whiteLabel = false
    // }

    // Generate embed code
    const embedCode = `<iframe src="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/embed/WAITLIST_ID" width="100%" height="400" frameborder="0"></iframe>`

    // Create waitlist
    const waitlist = await Waitlist.create({
      title,
      url,
      description,
      fields,
      userId: user._id,
      embedCode,
      referralCode: generateReferralCode(),
    })

    return NextResponse.json({
      message: 'Waitlist created successfully',
      waitlist,
    })
  } catch (error) {
    console.error('Error creating waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to create waitlist' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const waitlists = await Waitlist.find({ userId: user._id })

    return NextResponse.json({
      waitlists,
    })
  } catch (error) {
    console.error('Error fetching waitlists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waitlists' },
      { status: 500 }
    )
  }
}