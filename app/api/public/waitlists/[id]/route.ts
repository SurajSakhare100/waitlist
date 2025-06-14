import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Waitlist from '@/models/Waitlist'
import Submission from '@/models/Submission'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    const waitlist = await Waitlist.findById(params.id)
    if (!waitlist) {
      return NextResponse.json(
        { message: 'Waitlist not found' },
        { status: 404 }
      )
    }

    // Get submission count for social proof
    const submissionCount = await Submission.countDocuments({ waitlistId: waitlist._id })

    return NextResponse.json({
      waitlist: {
        _id: waitlist._id,
        title: waitlist.title,
        description: waitlist.description,
        placeholderText: waitlist.placeholderText,
        buttonText: waitlist.buttonText,
        successMessage: waitlist.successMessage,
        showLogo: waitlist.showLogo,
        showSocialProof: waitlist.showSocialProof,
        enableReferrals: waitlist.enableReferrals,
        whiteLabel: waitlist.whiteLabel,
        isActive: waitlist.isActive,
        submissionCount,
      },
    })
  } catch (error) {
    console.error('Get public waitlist error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}