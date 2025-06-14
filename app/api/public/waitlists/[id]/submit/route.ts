import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Waitlist from '@/models/Waitlist'
import Submission from '@/models/Submission'
import { generateReferralCode } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    const waitlist = await Waitlist.findById(params.id)
    if (!waitlist || !waitlist.isActive) {
      return NextResponse.json(
        { message: 'Waitlist not found or inactive' },
        { status: 404 }
      )
    }

    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingSubmission = await Submission.findOne({
      waitlistId: waitlist._id,
      email: email.toLowerCase(),
    })

    if (existingSubmission) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      )
    }

    // Get current position (next in line)
    const currentCount = await Submission.countDocuments({ waitlistId: waitlist._id })
    const position = currentCount + 1

    // Generate unique referral code
    let referralCode = generateReferralCode()
    while (await Submission.findOne({ referralCode })) {
      referralCode = generateReferralCode()
    }

    // Get client info
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check for referral
    const { searchParams } = new URL(request.url)
    const referralParam = searchParams.get('ref')
    let referredBy = null

    if (referralParam) {
      const referrer = await Submission.findOne({
        waitlistId: waitlist._id,
        referralCode: referralParam,
      })
      
      if (referrer) {
        referredBy = referrer._id
        // Increment referrer's count
        referrer.referralCount += 1
        await referrer.save()
      }
    }

    // Create submission
    const submission = await Submission.create({
      waitlistId: waitlist._id,
      email: email.toLowerCase(),
      position,
      referralCode,
      referredBy,
      ipAddress: clientIP,
      userAgent,
      isEmailVerified: true, // Auto-verify for now
    })

    return NextResponse.json({
      message: 'Successfully joined waitlist',
      position,
      referralCode,
      submission: {
        id: submission._id,
        position: submission.position,
        referralCode: submission.referralCode,
      },
    })
  } catch (error) {
    console.error('Submit to waitlist error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}