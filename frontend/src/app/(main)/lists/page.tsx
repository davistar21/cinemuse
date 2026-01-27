"use client";

/**
 * Lists Page
 *
 * Shows user's saved lists.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, ListMusic, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "@/lib/theme";
import { useAuthStore } from "@/stores/auth.store";
import { useListStore } from "@/stores/list.store";

export default function ListsPage() {
  const router = useRouter();
  const { currentPalette } = useTheme();
  const { user } = useAuthStore();
  const { lists, isLoading, fetchLists, createList } = useListStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLists();
    }
  }, [user, fetchLists]);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setIsCreating(true);
    await createList(newListName, newListDesc);
    setNewListName("");
    setNewListDesc("");
    setDialogOpen(false);
    setIsCreating(false);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <ListMusic
          className="h-16 w-16"
          style={{ color: "var(--text-muted)" }}
        />
        <p style={{ color: "var(--text-muted)" }}>
          Sign in to create and view your lists
        </p>
        <Button
          onClick={() => router.push("/auth/login")}
          style={{
            backgroundColor: currentPalette["--color-primary"],
            color: "white",
          }}
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            My Lists
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {lists.length} {lists.length === 1 ? "list" : "lists"}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              style={{
                backgroundColor: currentPalette["--color-primary"],
                color: "white",
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <DialogHeader>
              <DialogTitle style={{ color: "var(--text-primary)" }}>
                Create New List
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label style={{ color: "var(--text-secondary)" }}>Name</Label>
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="My Favorites"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label style={{ color: "var(--text-secondary)" }}>
                  Description (optional)
                </Label>
                <Textarea
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="A collection of..."
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              <Button
                onClick={handleCreateList}
                disabled={!newListName.trim() || isCreating}
                className="w-full"
                style={{
                  backgroundColor: currentPalette["--color-primary"],
                  color: "white",
                }}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create List"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Lists Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl animate-pulse"
              style={{ backgroundColor: "var(--bg-card)" }}
            />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <ListMusic
            className="h-12 w-12 mx-auto mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <p style={{ color: "var(--text-muted)" }}>
            No lists yet. Create your first list to get started!
          </p>
        </GlassCard>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {lists.map((list, i) => (
            <motion.div
              key={list.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <GlassCard
                className="p-5 cursor-pointer h-full"
                enableParallax={false}
              >
                <motion.button
                  onClick={() => router.push(`/lists/${list.id}`)}
                  className="w-full text-left h-full flex flex-col"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3
                    className="font-semibold text-lg mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {list.name}
                  </h3>
                  {list.description && (
                    <p
                      className="text-sm line-clamp-2 mb-3"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {list.description}
                    </p>
                  )}
                  <p
                    className="text-xs mt-auto"
                    style={{ color: currentPalette["--color-primary"] }}
                  >
                    {list.items?.length || 0} items
                  </p>
                </motion.button>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
