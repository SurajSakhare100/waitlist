import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Waitlist from '@/models/Waitlist'
import Submission from '@/models/Submission'
import { ObjectId } from 'mongodb'

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const submissions = await Submission.find({ waitlistId: waitlist._id })
      .sort({ position: 1 })
      .skip(skip)
      .limit(limit)

    const total = await Submission.countDocuments({ waitlistId: waitlist._id })

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get submissions error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  try {
    await dbConnect()
    
    // Get waitlist data
    const waitlist = await Waitlist.findOne({ _id: params.id })
    if (!waitlist) {
      return NextResponse.json(
        { message: 'Waitlist not found' },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        }
      )
    }

    // Check if email already exists
    const existingSubmission = await Submission.findOne({
      waitlistId: new ObjectId(params.id),
      email: email.toLowerCase()
    })

    if (existingSubmission) {
      return NextResponse.json(
        { message: 'You have already joined this waitlist' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        }
      )
    }

    // Create new submission
    const submission = await Submission.create({
      waitlistId: new ObjectId(params.id),
      email: email.toLowerCase(),
      status: 'pending',
      createdAt: new Date()
    })

    return NextResponse.json(
      { message: 'Successfully joined waitlist', submission },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      }
    )
  } catch (error) {
    console.error('Error submitting to waitlist:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      }
    )
  }
}