import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials!.email });
        if (!user) throw new Error('No user found');
        const isValid = await bcrypt.compare(credentials!.password, user.password);
        if (!isValid) throw new Error('Wrong password');
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          requiredHours: user.requiredHours,
          expectedStartTime: user.expectedStartTime
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.company = user.company;
        token.requiredHours = user.requiredHours;
        token.expectedStartTime = user.expectedStartTime;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.company = token.company;
      session.user.requiredHours = token.requiredHours;
      session.user.expectedStartTime = token.expectedStartTime;
      return session;
    }
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' as const }
};