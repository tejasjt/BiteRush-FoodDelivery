import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star, Clock, Minus, Plus, ShoppingBag, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodCard } from "@/components/site/FoodCard";
import { categoriesQuery, foodBySlugQuery, foodsQuery } from "@/lib/catalog";
import { foodImage } from "@/lib/food-images";
import { discountedPrice, inr } from "@/lib/format";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/food/$slug")({
  head: ({ params }) => {
    const title = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${title} — Order online | BiteRush` },
        { name: "description", content: `Order ${title} from BiteRush and get it delivered hot across Bengaluru.` },
        { property: "og:title", content: `${title} on BiteRush` },
        { property: "og:description", content: `Order ${title} online with live tracking and free delivery above ₹499.` },
      ],
    };
  },
  component: FoodDetails,
});

function FoodDetails() {
  const { slug } = Route.useParams();
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { data: food, isLoading } = useQuery(foodBySlugQuery(slug));
  const { data: foods } = useQuery(foodsQuery);
  const { data: categories } = useQuery(categoriesQuery);

  if (isLoading) {
    return (
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold">This dish is off the menu</h1>
        <p className="text-muted-foreground">The item you're looking for isn't available anymore.</p>
        <Button asChild className="rounded-full">
          <Link to="/menu" search={{ q: undefined, category: undefined }}>
            Back to menu
          </Link>
        </Button>
      </div>
    );
  }

  const price = discountedPrice(Number(food.price), food.offer_percent);
  const category = categories?.find((c) => c.id === food.category_id);
  const related = (foods ?? []).filter((f) => f.category_id === food.category_id && f.id !== food.id).slice(0, 4);

  function addToCart() {
    if (!food) return;
    addItem({ foodId: food.id, slug: food.slug, name: food.name, price, imageKey: food.image_key }, qty);
    toast.success(`${qty} × ${food.name} added to cart`);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-4 rounded-full">
        <Link to="/menu" search={{ q: undefined, category: category?.slug }}>
          <ChevronLeft className="size-4" /> Back to {category?.name ?? "menu"}
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl">
          <img
            src={foodImage(food.image_key)}
            alt={food.name}
            width={800}
            height={600}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {category?.name}
            </Badge>
            <Badge variant="outline" className={food.is_veg ? "text-primary" : "text-destructive"}>
              {food.is_veg ? "Veg" : "Non-veg"}
            </Badge>
            {food.offer_percent > 0 && (
              <Badge className="bg-highlight text-brand-deep border-0">{food.offer_percent}% OFF</Badge>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{food.name}</h1>

          <div className="text-muted-foreground mt-3 flex items-center gap-4 text-sm">
            <span className="text-foreground flex items-center gap-1 font-semibold">
              <Star className="fill-highlight text-highlight size-4" />
              {Number(food.rating).toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-4" /> {food.prep_minutes} min prep
            </span>
            <span>{food.is_available ? `${food.stock} left today` : "Sold out"}</span>
          </div>

          <p className="text-muted-foreground mt-5 leading-relaxed">{food.description}</p>

          <div className="mt-6">
            <h2 className="text-sm font-bold tracking-wide uppercase">Ingredients</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {food.ingredients.map((item) => (
                <li key={item} className="bg-secondary text-secondary-foreground rounded-full px-3 py-1.5 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-card mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{inr(price)}</span>
              {food.offer_percent > 0 && (
                <span className="text-muted-foreground line-through">{inr(Number(food.price))}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-full border p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full"
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <Button className="h-11 flex-1 rounded-full px-6" onClick={addToCart} disabled={!food.is_available}>
                <ShoppingBag className="size-4" /> Add to cart
              </Button>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pt-16">
          <h2 className="text-2xl font-extrabold">You may also like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <FoodCard key={item.id} food={item} categoryName={category?.name} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}