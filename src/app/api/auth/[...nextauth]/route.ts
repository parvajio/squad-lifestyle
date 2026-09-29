import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:
        process.env.AUTH_GOOGLE_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        'mock_google_client_id',
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET ||
        process.env.GOOGLE_CLIENT_SECRET ||
        'mock_google_client_secret',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@squad-lifestyle.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        await connectToDatabase();
        const userEmail = user.email.toLowerCase();
        const existingUser = await User.findOne({ email: userEmail });
        if (!existingUser) {
          await User.create({
            name: user.name || 'User',
            email: userEmail,
            image: user.image || undefined,
            role: 'USER',
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: 'ADMIN' | 'USER' }).role || 'USER';
      }
      if (trigger === 'update' && session?.user) {
        token.name = session.user.name;
        token.email = session.user.email;
        if (session.user.role) token.role = session.user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as 'ADMIN' | 'USER') || 'USER';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'squad_lifestyle_secret_key_2026_super_secure_987',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
