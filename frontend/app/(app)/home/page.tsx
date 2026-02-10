"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFiles } from "@/contexts/FileContext";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Folder, Plus, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// Premium gradients with more sophisticated color combinations
const gradients = [
  "from-violet-600 via-purple-600 to-indigo-700",
  "from-cyan-500 via-teal-500 to-emerald-600",
  "from-fuchsia-600 via-pink-600 to-rose-700",
  "from-amber-500 via-orange-500 to-red-600",
  "from-blue-600 via-indigo-600 to-purple-700",
  "from-emerald-500 via-green-500 to-teal-600",
];

// Card overlay gradients for a frosted glass effect
const cardOverlays = [
  "from-violet-500/10 via-purple-500/5 to-transparent",
  "from-cyan-500/10 via-teal-500/5 to-transparent",
  "from-fuchsia-500/10 via-pink-500/5 to-transparent",
  "from-amber-500/10 via-orange-500/5 to-transparent",
  "from-blue-500/10 via-indigo-500/5 to-transparent",
  "from-emerald-500/10 via-green-500/5 to-transparent",
];

export default function Home() {
  const router = useRouter();
  const { folders, loading, createFolder } = useFiles();
  const [username, setUsername] = useState("Scholar");
  const [createOpen, setCreateOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) setUsername(storedName);
  }, []);
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName, null);
    setNewFolderName("");
    setCreateOpen(false);
  };
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with proper overlay */}
      <div className="fixed inset-0 z-0">
        {/* Light Mode Image */}
        <img
          src="/backgrounds/light-background.jpeg"
          alt="Light Background"
          className="absolute inset-0 w-full h-full object block dark:hidden"
        />
        {/* Dark Mode Image */}
        <img
          src="/backgrounds/dark-background.jpeg"
          alt="Dark Background"
          className="absolute inset-0 w-full h-full object-cover hidden dark:block"
        />

        {/* Theme-Aware Overlay */}
        {/* Light mode: white-tinted glass | Dark mode: slate-950 deep glass */}
        <div className="absolute inset-0 bg-slate-100/20 dark:bg-slate-950/80 backdrop-blur-[2px] transition-colors duration-500" />

        {/* Subtle Gradient Glows (Visible mostly in dark mode) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent opacity-0 dark:opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-0 dark:opacity-100" />
      </div>

      <div className="relative z-10 p-2 max-w-7xl mx-auto ">

        {/* Header Section with enhanced styling */}
        <div className="mb-4 space-y-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-white flex items-center gap-2">
              Welcome back,{" "}
              <span className="font-mono">
                {username}
              </span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl italic">
              Your historical journey continues here. Select a Folder to dive back into your research and unlock the stories of the past.
            </p>
          </div>
        </div>

        {/* Folders Grid with enhanced cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          {loading ? (
            // Enhanced Loading State
            Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="group relative">
                  <div className="absolute inset-0 bg-linear-to-r from-purple-600/50 to-blue-600/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                  <Card className="relative h-56 border-none bg-slate-800/40 backdrop-blur-md">
                    <CardHeader className="h-full flex flex-col justify-between">
                      <Skeleton className="h-8 w-3/4 bg-slate-700/50" />
                      <Skeleton className="h-4 w-1/2 bg-slate-700/50" />
                    </CardHeader>
                  </Card>
                </div>
              ))
          ) : folders && folders.length > 0 ? (
            folders.map((folder, index) => (
              <div key={folder.id} className="group relative">
                {/* Glow effect behind card */}
                <div className={`absolute -inset-0.5 bg-linear-to-r ${gradients[index % gradients.length]} rounded-2xl blur opacity-30 group-hover:opacity-60 transition-all duration-500 group-hover:blur-lg`} />

                {/* Main Card */}
                <Card
                  onClick={() => router.push(`/${folder.id}`)}
                  className="relative h-56 border-none cursor-pointer transition-all duration-500 overflow-hidden group-hover:scale-[1.02] bg-slate-800/60 backdrop-blur-xl"
                >
                  {/* Animated gradient overlay */}
                  <div className={`absolute inset-0 bg-linear-to-br ${cardOverlays[index % cardOverlays.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  <CardHeader className="relative h-full flex flex-col justify-between p-6">
                    {/* Top Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-2xl bg-linear-to-br ${gradients[index % gradients.length]} shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                          <Folder className="w-6 h-6 text-white" />
                        </div>

                        {/* Hover Badge with animation */}
                        <Badge className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 backdrop-blur-md border-white/20 text-white px-3 py-1 flex items-center gap-1 bottom-0.5 right-5 absolute bg-green-500/15">
                          <span className="text-xs font-medium">Open</span>
                          <ArrowRight className="w-3 h-3 " />
                        </Badge>
                      </div>

                      <CardTitle className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-300">
                        {folder.name}
                      </CardTitle>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300 transition-colors">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm font-medium">Notebook</span>
                      </div>

                    </div>
                  </CardHeader>

                  <CardFooter>
                    {/* Bottom border accent */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r ${gradients[index % gradients.length]} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                  </CardFooter>
                </Card>

              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
              <div className="p-6 rounded-2xl bg-linear-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-white/10 flex justify-center items-center">
                <div className="relative">
                  <BookOpen
                    className="w-16 h-16 text-slate-400 cursor-pointer"
                    onClick={() => setCreateOpen(true)}
                  />
                  <Plus className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-500 rounded-full p-1 text-white shadow-lg" />
                  <img src="/images/home.png" className="h-75 w-75"/>
                </div>
              </div>

              <p className="text-slate-300 text-lg font-medium">
                No notebooks found. Create your first one to get started!
              </p>
              <p className="text-slate-400 text-sm">
                Begin your journey through history today 
              </p>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create new folder</DialogTitle>
                  </DialogHeader>
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                    placeholder="Folder name"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFolder}>Create</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}