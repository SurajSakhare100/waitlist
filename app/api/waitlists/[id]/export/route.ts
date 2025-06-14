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

    const submissions = await Submission.find({ waitlistId: waitlist._id })
      .sort({ position: 1 })

    // Generate CSV
    const csvHeaders = ['Position', 'Email', 'Verified', 'Referral Code', 'Referrals', 'Joined Date']
    const csvRows = submissions.map(submission => [
      submission.position,
      submission.email,
      submission.isEmailVerified ? 'Yes' : 'No',
      submission.referralCode,
      submission.referralCount,
      new Date(submission.createdAt).toISOString().split('T')[0]
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${waitlist.title}-submissions.csv"`,
      },
    })
  } catch (error) {
    console.error('Export submissions error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}