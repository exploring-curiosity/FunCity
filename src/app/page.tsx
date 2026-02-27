import { Sidebar } from '@/components/sidebar';
import { PostFeed } from '@/components/post-feed';

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
      <div className="min-w-0 flex-1">
        <PostFeed />
      </div>
      <Sidebar />
    </div>
  );
}
