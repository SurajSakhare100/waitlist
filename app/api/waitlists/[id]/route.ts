import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Waitlist from '@/models/Waitlist'
import Submission from '@/models/Submission'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const waitlist = await Waitlist.findOne({ _id: params.id, userId: user._id })
    if (!waitlist) {
      return NextResponse.json(
        { message: 'Waitlist not found' },
        { status: 404 }
      )
    }

    // Get submission count
    const submissionCount = await Submission.countDocuments({ waitlistId: waitlist._id })

    return NextResponse.json({
      waitlist: {
        ...waitlist.toObject(),
        submissionCount,
      },
    })
  } catch (error) {
    console.error('Get waitlist error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const waitlist = await Waitlist.findOne({ _id: params.id, userId: user._id })
    if (!waitlist) {
      return NextResponse.json(
        { message: 'Waitlist not found' },
        { status: 404 }
      )
    }

    const data = await request.json()
    
    // Check if user is trying to enable white label without premium
    if (data.whiteLabel && !user.isPremium) {
      return NextResponse.json(
        { message: 'White label features are only available for Pro users. Please upgrade to enable this feature.' },
        { status: 403 }
      )
    }

    // Update waitlist
    Object.assign(waitlist, {
      title: data.title,
      description: data.description,
      placeholderText: data.placeholderText,
      buttonText: data.buttonText,
      successMessage: data.successMessage,
      showLogo: data.showLogo,
      logoSize: data.logoSize,
      showSocialProof: data.showSocialProof,
      enableReferrals: data.enableReferrals,
      whiteLabel: user.isPremium ? data.whiteLabel : false, // Force whiteLabel to false for free users
      isActive: data.isActive,
    })

    await waitlist.save()

    return NextResponse.json({
      message: 'Waitlist updated successfully',
      waitlist,
    })
  } catch (error) {
    console.error('Update waitlist error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const waitlist = await Waitlist.findOne({ _id: params.id, userId: user._id })
    if (!waitlist) {
      return NextResponse.json(
        { message: 'Waitlist not found' },
        { status: 404 }
      )
    }

    // Delete all submissions for this waitlist
    await Submission.deleteMany({ waitlistId: waitlist._id })
    
    // Delete the waitlist
    await Waitlist.deleteOne({ _id: waitlist._id })

    return NextResponse.json({
      message: 'Waitlist deleted successfully',
    })
  } catch (error) {
    console.error('Delete waitlist error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}