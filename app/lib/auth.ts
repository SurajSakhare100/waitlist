import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('No user found with this email');
        }

        if (!user.isVerified) {
          throw new Error('Please verify your email before logging in');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          isPremium: user.isPremium,
          isVerified: user.isVerified,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await dbConnect();
        
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Create new user if doesn't exist
          await User.create({
            name: user.name,
            email: user.email,
            isVerified: true, // Google users are automatically verified
            isPremium: false,
          });
        } else if (!existingUser.isVerified) {
          // Update existing user if not verified
          existingUser.isVerified = true;
          await existingUser.save();
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isPremium = user.isPremium;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isPremium = token.isPremium as boolean;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 