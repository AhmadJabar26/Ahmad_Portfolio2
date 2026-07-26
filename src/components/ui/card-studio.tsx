import React from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Label } from "./label";

const CardDemo = () => {
  return (
    <Card className="w-full max-w-md bg-zinc-950/80 border-white/10 text-white shadow-xl shadow-black/50 backdrop-blur-md rounded-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight text-white">Login to your account</CardTitle>
        <CardDescription className="text-zinc-400 text-sm">Enter your email below to login to your account</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="ml-auto inline-block text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button type="submit" className="w-full cursor-pointer">
          Login
        </Button>
        <Button variant="outline" className="w-full cursor-pointer">
          Continue with Google
        </Button>
        <div className="mt-4 text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <a href="#" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
            Sign up
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CardDemo;
