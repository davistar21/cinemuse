"use client";

/**
 * List Detail Page
 *
 * View and manage a specific user list.
 */

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { GlassCard } from "@/components/glass-card";
import { MediaCard } from "@/components/media-card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useListStore } from "@/stores/list.store";
import { useAuthStore } from "@/stores/auth.store";
import { Skeleton } from "@/components/ui/skeleton";

interface ListDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ListDetailPage({ params }: ListDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { currentList, fetchList, deleteList, removeItemFromList, isLoading } =
    useListStore();
  const { user } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchList(id);
  }, [id, fetchList]);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteList(id);
    router.push("/lists");
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItemFromList(id, itemId);
  };

  if (isLoading && !currentList) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <Skeleton className="aspect-[2/3]" />
          <Skeleton className="aspect-[2/3]" />
          <Skeleton className="aspect-[2/3]" />
        </div>
      </div>
    );
  }

  if (!currentList) {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--text-muted)" }}>List not found</p>
        <Button
          variant="ghost"
          onClick={() => router.push("/lists")}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-start md:justify-between gap-4"
      >
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/lists")}
            className="mb-4 pl-0 hover:pl-2 transition-all"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lists
          </Button>

          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {currentList.name}
          </h1>
          {currentList.description && (
            <p
              className="text-lg mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {currentList.description}
            </p>
          )}
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <Calendar className="h-4 w-4" />
            Created {format(new Date(currentList.createdAt), "MMMM d, yyyy")}
          </div>
        </div>

        {/* Actions */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              style={{
                borderColor: "#ef4444",
                color: "#ef4444",
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete List
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle style={{ color: "var(--text-primary)" }}>
                Are you sure?
              </AlertDialogTitle>
              <AlertDialogDescription
                style={{ color: "var(--text-secondary)" }}
              >
                This action cannot be undone. This will permanently delete your
                list "{currentList.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel style={{ color: "var(--text-primary)" }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white border-none"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      {/* Items Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {!currentList.items || currentList.items.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p style={{ color: "var(--text-muted)" }}>
              This list is empty. Add some media to get started!
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentList.items.map((item) => {
              if (!item.media) return null;
              return (
                <div key={item.id} className="relative group">
                  <MediaCard
                    id={item.media.id}
                    title={item.media.title}
                    type={item.media.type as any}
                    posterUrl={item.media.posterUrl}
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
