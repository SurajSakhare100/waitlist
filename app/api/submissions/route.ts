import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Waitlist from '@/models/Waitlist';
import Submission from '@/models/Submission';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const waitlistId = searchParams.get('waitlistId');

    if (!waitlistId) {
      return NextResponse.json(
        { error: 'Waitlist ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns the waitlist
    const waitlist = await Waitlist.findOne({
      _id: waitlistId,
      userId: user._id,
    });

    if (!waitlist) {
      return NextResponse.json(
        { error: 'Waitlist not found or unauthorized' },
        { status: 404 }
      );
    }

    const submissions = await Submission.find({ waitlistId })
      .sort({ createdAt: -1 });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { waitlistId, email, name, additionalFields } = body;

    if (!waitlistId || !email) {
      return NextResponse.json(
        { error: 'Waitlist ID and email are required' },
        { status: 400 }
      );
    }

    // Verify user owns the waitlist
    const waitlist = await Waitlist.findOne({
      _id: waitlistId,
      userId: user._id,
    });

    if (!waitlist) {
      return NextResponse.json(
        { error: 'Waitlist not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({
      waitlistId,
      email,
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Email already submitted to this waitlist' },
        { status: 400 }
      );
    }

    const submission = await Submission.create({
      waitlistId,
      email,
      name,
      additionalFields,
    });

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
} 