"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState(""); // Add new state for submission errors

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError(""); // Clear previous errors

    try {
      const response = await axios.post("/api/auth", {
        username,
        password,
      });

      const data = response.data; // Remove .data() as it's not needed

      if (response.status === 200) {
        // Check status code instead of success property
        console.log("Authenticated user:", data.user);
        localStorage.setItem("authToken", data.user.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/");
      } else {
        setSubmitError(data.message || "Authentication failed");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSubmitError(
          error.response?.data?.message || "Network error, please try again"
        );
      } else {
        setSubmitError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = e.target.name;
    switch (fieldName) {
      case "username":
        setUsernameError(
          username.length < 3 ? "Username must be more than 3 characters" : ""
        );
        break;
      case "password":
        setPasswordError(
          password.length < 8 ? "Password must be 8 or more characters" : ""
        );
        break;
    }
  };

  const isFormValid = username.length >= 3 && password.length >= 8;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md space-y-8 bg-card/90 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-brand/20">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-brand">Lawfirm.ai</h1>
          <p className="text-muted-foreground mt-2">
            Your AI-powered legal assistant
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-foreground"
              >
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={handleBlur}
                className={`mt-1 block w-full ${
                  usernameError ? "border-destructive" : ""
                }`}
                placeholder="Enter your username"
              />
              {usernameError && (
                <p className="mt-1 text-sm text-destructive">{usernameError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handleBlur}
                className={`mt-1 block w-full ${
                  passwordError ? "border-destructive" : ""
                }`}
                placeholder="Enter your password"
              />
              {passwordError && (
                <p className="mt-1 text-sm text-destructive">{passwordError}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white cursor-pointer"
              disabled={!isFormValid}
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Loading</span>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </>
              ) : (
                "Login / Signup"
              )}
            </Button>

            {/* Add error message display */}
            {submitError && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <Link
                href="https://sourabh-portfolio-coral.vercel.app/"
                className="text-sm text-brand hover:text-brand-dark transition-colors"
              >
                Dev @Sourabh
              </Link>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
