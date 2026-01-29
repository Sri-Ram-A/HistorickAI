"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { TimelineEntry } from "../types";

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-transparent backdrop-blur-md bg-white/5 dark:bg-neutral-950/5 font-sans md:px-10 relative z-10"
      ref={containerRef}
    >
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10 group"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-lg shadow-lg flex items-center justify-center border border-white/20 dark:border-neutral-800/20 transition-all duration-300 group-hover:scale-110">
                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border border-white/20 dark:border-neutral-800/20 p-2 shadow-inner" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-700 dark:text-neutral-300 transition-colors duration-300 group-hover:text-purple-500 dark:group-hover:text-purple-400">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-700 dark:text-neutral-300 transition-colors duration-300 group-hover:text-purple-500 dark:group-hover:text-purple-400">
                {item.title}
              </h3>
              <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 dark:border-neutral-800/20 transition-all duration-300 hover:transform hover:scale-[1.02]">
                {item.content}
              </div>
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-gradient-to-b from-transparent via-purple-500/30 to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};