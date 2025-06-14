import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import dbConnect from '@/lib/mongodb'
import Waitlist from '@/models/Waitlist'
import Submission from '@/models/Submission'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  try {
    await dbConnect()
    
    // Get waitlist data
    const waitlist = await Waitlist.findOne(
      { _id: params.id},
      
    )


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

    // Get submission count
    const submissionCount = await Submission.countDocuments({
      waitlistId: new ObjectId(params.id)
    })


    return NextResponse.json(
      {
        data: {
          waitlist,
          submissionCount
        }
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      }
    )
  } catch (error) {
    console.error('Error fetching waitlist for embed:', error)
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