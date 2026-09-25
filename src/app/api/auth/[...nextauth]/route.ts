import { connectDB } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions : NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",

            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const data = loginSchema.parse(credentials);
                await connectDB();
                const user = await User.findOne({email: data.email}).select("+password");

                if (!user) {
                    return null;
                }
                
                const isValid = await bcrypt.compare(data.password, user.password);
                if(!isValid) {
                    return null;
                }
                return{
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };