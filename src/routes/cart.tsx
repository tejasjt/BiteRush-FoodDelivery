import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { foodImage } from "@/lib/food-images";
import { FREE_DELIVERY_ABOVE, inr } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — BiteRush" },
      { name: "description", content: "Review your BiteRush order, adjust quantities and head to checkout." },
      { property: "og:title", content: "Your BiteRush Cart" },
      { property: "og:description", content: "Review items, update quantities and check out in seconds." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQuantity, removeItem, subtotal, deliveryFee, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span className="bg-secondary flex size-20 items-center justify-center rounded-full">
          <ShoppingBag className="text-muted-foreground size-9" />
        </span>
        <h1 className="text-2xl font-extrabold">Your cart is empty</h1>
        <p className="text-muted-foreground max-w-sm">
          Add a biryani, a pizza or a cold brew and it will show up right here.
        </p>
        <Button asChild className="mt-2 rounded-full">
          <Link to="/menu" search={{ q: undefined, category: undefined }}>
            Browse the menu
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Your cart</h1>
      <p className="text-muted-foreground mt-2">{items.length} item(s) ready to go.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.foodId} className="surface-card flex gap-4 p-4">
              <img
                src={foodImage(item.imageKey)}
                alt={item.name}
                loading="lazy"
                width={800}
                height={600}
                className="size-24 shrink-0 rounded-xl object-cover"
              />
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <Link to="/food/$slug" params={{ slug: item.slug }} className="font-bold hover:underline">
                    {item.name}
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive size-8 shrink-0"
                    onClick={() => removeItem(item.foodId)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">{inr(item.price)} each</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-full border p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full"
                      onClick={() => setQuantity(item.foodId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full"
                      onClick={() => setQuantity(item.foodId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <span className="font-extrabold">{inr(item.price * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="surface-card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Bill summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Item subtotal" value={inr(subtotal)} />
            <Row label="Delivery fee" value={deliveryFee === 0 ? "FREE" : inr(deliveryFee)} />
            {deliveryFee > 0 && (
              <p className="text-muted-foreground text-xs">
                Add {inr(FREE_DELIVERY_ABOVE - subtotal)} more for free delivery.
              </p>
            )}
          </dl>
          <Separator className="my-4" />
          <div className="flex items-center justify-between text-lg font-extrabold">
            <span>Total</span>
            <span>{inr(total)}</span>
          </div>
          <Button asChild size="lg" className="mt-6 h-12 w-full rounded-full">
            <Link to="/checkout">
              Proceed to checkout <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full rounded-full">
            <Link to="/menu" search={{ q: undefined, category: undefined }}>
              Add more items
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}