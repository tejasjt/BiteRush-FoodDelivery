import { Link } from "@tanstack/react-router";
import { Star, Plus, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { foodImage } from "@/lib/food-images";
import { discountedPrice, inr } from "@/lib/format";
import { useCart } from "@/lib/cart";
import type { Food } from "@/lib/catalog";

export function FoodCard({ food, categoryName }: { food: Food; categoryName?: string | undefined }) {
  const { addItem } = useCart();
  const price = discountedPrice(Number(food.price), food.offer_percent);

  function add() {
    addItem({
      foodId: food.id,
      slug: food.slug,
      name: food.name,
      price,
      imageKey: food.image_key,
    });
    toast.success(`${food.name} added to cart`);
  }

  return (
    <article className="surface-card lift-on-hover group flex flex-col overflow-hidden">
      <Link to="/food/$slug" params={{ slug: food.slug }} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={foodImage(food.image_key)}
          alt={food.name}
          loading="lazy"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {food.offer_percent > 0 && (
            <Badge className="bg-highlight text-brand-deep border-0 font-bold">{food.offer_percent}% OFF</Badge>
          )}
          {!food.is_available && <Badge variant="destructive">Sold out</Badge>}
        </div>
        <span className="bg-background/90 absolute right-3 bottom-3 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold">
          <Star className="fill-highlight text-highlight size-3.5" />
          {Number(food.rating).toFixed(1)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase">
          <span className={food.is_veg ? "text-primary" : "text-destructive"}>{food.is_veg ? "Veg" : "Non-veg"}</span>
          {categoryName && <span>• {categoryName}</span>}
        </div>
        <Link to="/food/$slug" params={{ slug: food.slug }}>
          <h3 className="line-clamp-1 text-base font-bold">{food.name}</h3>
        </Link>
        <p className="text-muted-foreground line-clamp-2 text-sm">{food.description}</p>
        <div className="text-muted-foreground mt-auto flex items-center gap-1 pt-2 text-xs">
          <Clock className="size-3.5" /> {food.prep_minutes} min
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold">{inr(price)}</span>
            {food.offer_percent > 0 && (
              <span className="text-muted-foreground text-sm line-through">{inr(Number(food.price))}</span>
            )}
          </div>
          <Button size="sm" className="rounded-full" onClick={add} disabled={!food.is_available}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
      </div>
    </article>
  );
}