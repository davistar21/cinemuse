"use client";

/**
 * Media Detail Page
 *
 * Shows full details for a single media item.
 */

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  Calendar,
  Film,
  Tv,
  BookOpen,
  Gamepad2,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/glass-card";
import { useMedia } from "@/hooks/use-media";
import { useTheme } from "@/lib/theme";
import { Skeleton } from "@/components/ui/skeleton";

const typeIcons = {
  movie: Film,
  show: Tv,
  book: BookOpen,
  game: Gamepad2,
};

const typeLabels = {
  movie: "Movie",
  show: "TV Show",
  book: "Book",
  game: "Game",
};

interface MediaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MediaDetailPage({ params }: MediaDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { media, isLoading, error } = useMedia(id);
  const { currentPalette } = useTheme();

  if (isLoading) {
    return <MediaDetailSkeleton />;
  }

  if (error || !media) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p style={{ color: "var(--text-muted)" }}>
          {error || "Media not found"}
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const Icon = typeIcons[media.type];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </Button>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="grid md:grid-cols-[300px,1fr] gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Poster */}
        <div className="relative">
          <GlassCard className="overflow-hidden">
            <div className="aspect-[2/3] relative">
              {media.posterUrl ? (
                <Image
                  src={media.posterUrl}
                  alt={media.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: "var(--bg-surface)" }}
                >
                  <Icon
                    className="h-20 w-20 opacity-30"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
              )}
            </div>
          </GlassCard>

          {/* Actions */}
          <div className="mt-4 space-y-2">
            <Button
              className="w-full"
              style={{
                backgroundColor: currentPalette["--color-primary"],
                color: "white",
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to List
            </Button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Title & Meta */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge
                variant="outline"
                style={{
                  borderColor: currentPalette["--color-primary"],
                  color: currentPalette["--color-primary"],
                }}
              >
                <Icon className="h-3 w-3 mr-1" />
                {typeLabels[media.type]}
              </Badge>
              {media.year && (
                <span
                  className="flex items-center gap-1 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Calendar className="h-3 w-3" />
                  {media.year}
                </span>
              )}
              {media.rating && (
                <span
                  className="flex items-center gap-1 text-sm"
                  style={{ color: currentPalette["--color-primary"] }}
                >
                  <Star className="h-3 w-3" />
                  {media.rating.toFixed(1)}
                </span>
              )}
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              {media.title}
            </h1>

            {/* Genres */}
            {media.genres && media.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {media.genres.map((genre) => (
                  <Badge
                    key={genre}
                    variant="secondary"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {media.description && (
            <GlassCard className="p-6">
              <h2
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Overview
              </h2>
              <p
                className="leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {media.description}
              </p>
            </GlassCard>
          )}

          {/* Tags */}
          {media.tags && media.tags.length > 0 && (
            <GlassCard className="p-6">
              <h2
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Mood & Themes
              </h2>
              <div className="flex flex-wrap gap-2">
                {media.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    style={{
                      backgroundColor: `${currentPalette["--color-primary"]}20`,
                      color: currentPalette["--color-primary"],
                      border: `1px solid ${currentPalette["--color-primary"]}40`,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function MediaDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      <Skeleton className="h-10 w-32 mb-6" />
      <div className="grid md:grid-cols-[300px,1fr] gap-8">
        <Skeleton className="aspect-[2/3] rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
