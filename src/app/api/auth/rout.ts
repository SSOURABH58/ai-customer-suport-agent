import { NextResponse } from "next/server";
import Passport from "@/auth/auth-strategy";

const authenticate = (req: Request) => {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    Passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) return reject(err);
      if (!user) return reject(new Error("Authentication failed"));
      resolve(user);
    })(req as any);
  });
};

export async function POST(req: Request) {
  try {
    const userAuth = await authenticate(req);
    return NextResponse.json({
      success: true,
      user: userAuth,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    );
  }
}
