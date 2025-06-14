import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Waitlist from '@/models/Waitlist'
import { generateReferralCode } from '@/lib/utils'

export async function POST(request: NextRequest) {
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
    
    const user = await User.findById(decoded.userId)
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

    const waitlist = await Waitlist.create({
      userId: user._id,
      title: data.title,
      url: data.url,
      description: data.description,
      placeholderText: data.placeholderText,
      buttonText: data.buttonText,
      successMessage: data.successMessage,
      showLogo: data.showLogo,
      logoSize: data.logoSize,
      showSocialProof: data.showSocialProof,
      enableReferrals: data.enableReferrals,
      whiteLabel: user.isPremium ? data.whiteLabel : false, // Only premium users can use white label
      embedCode: embedCode.replace('WAITLIST_ID', ''), // Will be updated after creation
    })

    // Update embed code with actual ID
    waitlist.embedCode = embedCode.replace('WAITLIST_ID', waitlist._id.toString())
    await waitlist.save()

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
    
    const user = await User.findById(decoded.userId)
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