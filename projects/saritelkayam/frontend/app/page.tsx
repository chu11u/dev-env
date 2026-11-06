import { getFeaturedHomepagePosts } from "@/lib/blog";
import HomePageClient from "./HomePageClient";

/** Homepage ISR: blog strip reflects CMS featured posts within ~60s of publish. */
export const revalidate = 60;

export default async function HomePage() {
  const initialFeaturedPosts = await getFeaturedHomepagePosts();
  return (
    <HomePageClient initialFeaturedPosts={initialFeaturedPosts} />
  );
}
