import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import Razorpay from 'razorpay'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

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

    if (user.isPremium) {
      return NextResponse.json(
        { message: 'User is already premium' },
        { status: 400 }
      )
    }

    const { amount, currency } = await request.json()

    const options = {
      amount: amount, // amount in smallest currency unit (cents)
      currency: currency || 'USD',
      receipt: `receipt_${user._id}`,
      notes: {
        userId: user._id.toString(),
        email: user.email,
        plan: 'pro',
      },
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}