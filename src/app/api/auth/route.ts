import { NextResponse } from "next/server";
import Passport from "@/auth/auth-strategy";
import { connectToDB } from "@/db/mongo";

const authenticate = async (req: Request) => {
  const body = await req.json();
  console.log("HI2", body);

  return new Promise((resolve, reject) => {
    //@ts-expect-error Passport types might complain about mock req
    Passport.authenticate("local", { session: false }, (err, user, info) => {
      console.log("error", err, user, info);

      if (err) return reject(err);
      if (!user) return reject(new Error("Authentication failed"));
      resolve(user);
    })({ body } as unknown as import("http").IncomingMessage);
  });
};

export async function POST(req: Request) {
  try {
    await connectToDB();
    const userAuth = await authenticate(req);
    return NextResponse.json({
      success: true,
      user: userAuth,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 401 }
    );
  }
}
