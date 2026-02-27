'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Award } from 'lucide-react';
import { PostCard } from '@/components/post-card';
import { Sidebar } from '@/components/sidebar';
import { track } from '@/lib/analytics';
import type { PostWithDetails } from '@/lib/types';

interface UserProfile {
  id: string;
  username: string;
  age_group: string;
  country: string;
  nyc_familiarity: string;
  created_at: string;
  post_karma: number;
  comment_karma: number;
  total_karma: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          fetch(`/api/users/${username}`),
          fetch(`/api/posts?sort=new`),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          track('profile_viewed', { viewed_username: username });

          if (postsRes.ok) {
            const allPosts = await postsRes.json();
            const userPosts = (allPosts as PostWithDetails[]).filter(
              (p) => p.author_username === username
            );
            setPosts(userPosts);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <div className="min-w-0 flex-1">
          <div className="h-48 animate-pulse rounded-lg border border-border bg-card" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">User not found</h1>
        <p className="mt-2 text-muted-foreground">u/{username} doesn&apos;t exist.</p>
        <Link href="/" className="mt-4 inline-block text-neon-cyan hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
      <div className="min-w-0 flex-1 space-y-4">
        {/* Profile header */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-2xl font-bold text-neon-cyan">
              {profile.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">u/{profile.username}</h1>
              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-neon-cyan" />
                  {profile.total_karma} karma
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {joinDate}
                </span>
              </div>
              <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                <span>{profile.post_karma} post karma</span>
                <span>·</span>
                <span>{profile.comment_karma} comment karma</span>
              </div>
            </div>
          </div>
        </div>

        {/* User's posts */}
        <h2 className="text-sm font-semibold text-muted-foreground">Posts by u/{profile.username}</h2>
        {posts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
            No posts yet.
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      <Sidebar />
    </div>
  );
}
