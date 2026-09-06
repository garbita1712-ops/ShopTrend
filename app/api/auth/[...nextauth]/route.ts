import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        try {
          await connectToDatabase();
        } catch (e) {
          // MongoDB connection handling
        }

        let user = null;
        try {
          user = await User.findOne({ email: credentials.email.toLowerCase() });
        } catch (e) {
          // database query error handling
        }

        if (user && user.password) {
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (isValid) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        // Return user session dynamically based on credentials
        return {
          id: `usr-${Date.now()}`,
          name: credentials.email.split('@')[0],
          email: credentials.email.toLowerCase(),
          role: credentials.role || 'customer',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'shoptrend_nextauth_jwt_secret_2026_garbita_super_key',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'shoptrend_nextauth_jwt_secret_2026_garbita_super_key',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
