import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { categoriesQuery, foodsQuery } from "@/lib/catalog";
import { foodImage } from "@/lib/food-images";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Food Categories — BiteRush Bengaluru" },
      {
        name: "description",
        content: "Pizza, burgers, biryani, South Indian, North Indian, Chinese, desserts and beverages on BiteRush.",
      },
      { property: "og:title", content: "Food Categories on BiteRush" },
      { property: "og:description", content: "Eight kitchens covering everything from dosas to lava cake." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories, isLoading } = useQuery(categoriesQuery);
  const { data: foods } = useQuery(foodsQuery);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Categories</h1>
      <p className="text-muted-foreground mt-2 max-w-xl">
        Every BiteRush category is cooked in a dedicated kitchen station, so a biryani order never tastes of last
        night's chilli paneer.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)
          : (categories ?? []).map((cat) => {
              const count = (foods ?? []).filter((f) => f.category_id === cat.id).length;
              return (
                <Link
                  key={cat.id}
                  to="/menu"
                  search={{ category: cat.slug, q: undefined }}
                  className="surface-card lift-on-hover group relative overflow-hidden"
                >
                  <img
                    src={foodImage(cat.image_key)}
                    alt={cat.name}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.16_0.03_160/0.9),transparent_60%)]" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-[oklch(0.97_0.01_140)]">
                    <div>
                      <h2 className="text-xl font-bold">{cat.name}</h2>
                      <p className="text-sm opacity-75">{count} dishes</p>
                    </div>
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
}