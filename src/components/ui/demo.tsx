import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

const CardSoftDemo = () => {
  return (
    <Card className="bg-indigo-600/20 border-indigo-500/30 text-white max-w-md gap-0 backdrop-blur-md rounded-2xl">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
          Design Throwdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 text-sm leading-relaxed text-zinc-300">
        Where passion, pressure, and pixels collide—push your creativity to the edge and show what you are made of.
      </CardContent>
    </Card>
  );
};

export default CardSoftDemo;
