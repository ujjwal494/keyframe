import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/app/models/user";

export const authOptions = {
  providers: [
    // OAuth Providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),

    // Credentials Provider (Email & Password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await dbConnect();

        // 1. Find user in MongoDB
        const user = await User.findOne({ email: credentials.email.toLowerCase().trim() });
        if (!user) {
          throw new Error("No account found with this email");
        }

        // 2. Prevent OAuth users from logging in via credentials if they don't have a password
        if (!user.passwordHash) {
          throw new Error("This account uses OAuth. Please sign in with Google or GitHub.");
        }

        // 3. Verify password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        // 4. Return user object (NextAuth will embed this in the JWT)
        return {
          id: user._id.toString(),
          name: user.displayName,
          email: user.email,
          image: user.profilePic,
          username: user.username,
        };
      },
    }),
  ],

  callbacks: {
    // This callback runs whenever a user signs in
    async signIn({ user, account, profile }) {
      if (account.provider === "google" || account.provider === "github") {
        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // If they don't exist, create a new user automatically
          // We generate a fallback username from their email if needed
          const baseUsername = user.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
          
          await User.create({
            email: user.email,
            displayName: user.name || "User",
            username: baseUsername + Math.floor(Math.random() * 10000), // Ensure uniqueness
            profilePic: user.image || "",
            provider: account.provider,
            providerId: account.providerAccountId,
          });
        }
      }
      return true; // Allow sign in
    },

    // This callback runs whenever a JWT is created or updated
    async jwt({ token, user, trigger, session, account }) {
      // If user object is passed, it means this is the initial sign in
      if (user) {
        await dbConnect();
        // Fetch the actual user from our DB to get the correct _id and username
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.username = dbUser.username;
        } else {
          token.id = user.id;
        }
      }
      return token;
    },

    // This callback runs whenever the session is checked (e.g. useSession on frontend)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,

  pages: {
    signIn: "/login", // Custom login page
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
