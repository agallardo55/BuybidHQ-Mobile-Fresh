import { useRecentBidRequests } from "@/hooks/useRecentBidRequests";
import { RecentPostCard } from "@/components/RecentPostCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import AutoScroll from "embla-carousel-auto-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export const RecentPostsCarousel = () => {
  const { data: recentPosts, isLoading, error } = useRecentBidRequests();

  useEffect(() => {
    if (recentPosts) {
      console.log('RecentPostsCarousel: Data loaded', {
        count: recentPosts.length,
        posts: recentPosts
      });
    }
  }, [recentPosts]);

  if (isLoading) {
    return (
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Log error for debugging
  if (error) {
    console.error('Failed to load recent bid requests:', error);
    return null;
  }

  // Don't render if no data
  if (!recentPosts || recentPosts.length === 0) {
    console.log('No recent posts to display');
    return null;
  }

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Latest Market View listings
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what's being bought and sold on BuybidHQ
          </p>
        </div>
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            AutoScroll({
              speed: 1,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {recentPosts.map((post) => (
              <CarouselItem
                key={post.id}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <RecentPostCard
                  vehicle={post.vehicle}
                  imageUrl={post.image_url}
                  highestOffer={post.highest_offer}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};
