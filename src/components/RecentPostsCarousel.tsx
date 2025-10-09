import { useRecentBidRequests } from "@/hooks/useRecentBidRequests";
import { RecentPostCard } from "@/components/RecentPostCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import AutoScroll from "embla-carousel-auto-scroll";
import { useRef } from "react";

export const RecentPostsCarousel = () => {
  const { data: recentPosts, isLoading } = useRecentBidRequests();
  
  const autoScrollPlugin = useRef(
    AutoScroll({ 
      speed: 1,
      startDelay: 0,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  );

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

  if (!recentPosts || recentPosts.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Latest Market View listings
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what's being bought and sold on BuyBidHQ
          </p>
        </div>
      </div>

      <div className="relative w-full">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[autoScrollPlugin.current]}
          className="w-full"
          onMouseEnter={() => autoScrollPlugin.current.stop()}
          onMouseLeave={() => autoScrollPlugin.current.play()}
        >
          <CarouselContent className="-ml-4">
            {recentPosts.map((post) => (
              <CarouselItem
                key={post.id}
                className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <RecentPostCard
                  vehicle={post.vehicle}
                  imageUrl={post.image_url}
                  highestOffer={post.highest_offer}
                  createdAt={post.created_at}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};
