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
    
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Get user's waitlists
    const waitlists = await Waitlist.find({ userId: user._id })
    const waitlistIds = waitlists.map(w => w._id)

    // Get all submissions for user's waitlists
    const allSubmissions = await Submission.find({ 
      waitlistId: { $in: waitlistIds } 
    })

    // Get submissions in date range
    const rangeSubmissions = await Submission.find({
      waitlistId: { $in: waitlistIds },
      createdAt: { $gte: startDate }
    })

    // Calculate stats
    const totalSignups = allSubmissions.length
    const totalWaitlists = waitlists.length
    const verifiedEmails = allSubmissions.filter(s => s.isEmailVerified).length
    const totalReferrals = allSubmissions.reduce((sum, s) => sum + s.referralCount, 0)
    
    // This week signups
    const weekStart = new Date()
    weekStart.setDate(now.getDate() - 7)
    const signupsThisWeek = allSubmissions.filter(s => 
      new Date(s.createdAt) >= weekStart
    ).length

    // This month signups
    const monthStart = new Date()
    monthStart.setDate(now.getDate() - 30)
    const signupsThisMonth = allSubmissions.filter(s => 
      new Date(s.createdAt) >= monthStart
    ).length

    // Top performing waitlists
    const waitlistStats = await Promise.all(
      waitlists.map(async (waitlist) => {
        const submissionCount = await Submission.countDocuments({ 
          waitlistId: waitlist._id 
        })
        return {
          _id: waitlist._id,
          title: waitlist.title,
          submissionCount,
        }
      })
    )

    const topWaitlists = waitlistStats
      .sort((a, b) => b.submissionCount - a.submissionCount)
      .slice(0, 5)

    // Recent signups
    const recentSubmissions = await Submission.find({
      waitlistId: { $in: waitlistIds }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('waitlistId', 'title')

    const recentSignups = recentSubmissions.map(submission => ({
      email: submission.email,
      waitlistTitle: (submission.waitlistId as any)?.title || 'Unknown',
      createdAt: submission.createdAt,
    }))

    return NextResponse.json({
      totalSignups,
      totalWaitlists,
      verifiedEmails,
      totalReferrals,
      signupsThisWeek,
      signupsThisMonth,
      topWaitlists,
      recentSignups,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}