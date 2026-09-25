import { connectDB } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = registerSchema.parse(body);

        await connectDB();
        
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return NextResponse.json(
                {message: "Email already exists"},
                { status: 409}
            );
        }

        const  hashedPassword = await bcrypt.hash(data.password, 12);
        await User.create({ ...data, password: hashedPassword });

        return NextResponse.json({message: "User created successfully"}, { status: 201 });
    } catch {
        return NextResponse.json({message: "An error occurred while creating the user"}, { status: 400 });
    }
}