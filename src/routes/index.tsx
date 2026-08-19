import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, Timer, ShieldCheck, Percent, ArrowRight, Quote } from "lucide-react";

import heroImage from "@/assets/hero-spread.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodCard } from "@/components/site/FoodCard";
import { categoriesQuery, foodsQuery, type Food } from "@/lib/catalog";
import { foodImage } from "@/lib/food-images";
import { discountedPrice, inr } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BiteRush — Order Food Online in Bengaluru" },
      {
        name: "description",
        content:
          "Craving biryani, pizza or a late-night burger? BiteRush delivers from our own kitchens across Bengaluru in under 40 minutes.",
      },
      { property: "og:title", content: "BiteRush — Order Food Online in Bengaluru" },
      {
        property: "og:description",
        content: "Biryani, pizza, burgers, dosas and desserts delivered hot across Bengaluru.",
      },
    ],
  }),
  component: Home,
});

const REVIEWS = [
  {
    name: "Ananya Rao",
    area: "Indiranagar",
    text: "The Hyderabadi biryani actually arrives steaming. Ordered four Fridays in a row and it has never let me down.",
  },
  {
    name: "Karthik Menon",
    area: "Koramangala",
    text: "Live tracking is accurate to the minute and the packaging keeps dosas crisp. Easily my default dinner app.",
  },
  {
    name: "Priya Shetty",
    area: "Whitefield",
    text: "Portions are generous, pricing is honest, and support actually replies. The lava cake is dangerous.",
  },
];

function Home() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const { data: categories } = useQuery(categoriesQuery);
  const { data: foods, isLoading } = useQuery(foodsQuery);

  const categoryName = (id: string) => categories?.find((c) => c.id === id)?.name;
  const popular = (foods ?? []).filter((f) => f.is_popular).slice(0, 4);
  const recommended = (foods ?? []).filter((f) => f.is_recommended).slice(0, 4);
  const offers = (foods ?? []).filter((f) => f.offer_percent > 0).slice(0, 3);
  const featured = (foods ?? []).slice(0, 8);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    void navigate({ to: "/menu", search: { q: term || undefined, category: undefined } });
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="A spread of biryani, pizza, burger and dosa on a dark table"
          width={1600}
          height={1104}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,oklch(0.16_0.03_160/0.94)_0%,oklch(0.16_0.03_160/0.78)_45%,oklch(0.16_0.03_160/0.35)_100%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:py-36">
          <div className="fade-up max-w-2xl text-[oklch(0.97_0.01_140)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase backdrop-blur">
              Now delivering across Bengaluru
            </span>
            <h1 className="mt-6 text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-6xl">
              What are you craving?
            </h1>
            <p className="mt-5 max-w-xl text-base opacity-80 sm:text-lg">
              Chef-run kitchens, real ingredients and a 40-minute promise. Search a dish, build your cart and track
              it to your door.
            </p>

            <form onSubmit={submitSearch} className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" />
                <Input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search biryani, pizza, dosa…"
                  aria-label="Search food"
                  className="bg-background text-foreground h-14 rounded-full border-0 pl-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 rounded-full px-8 text-base">
                Find food
              </Button>
            </form>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-sm">
              {[
                { icon: Timer, label: "Avg. delivery", value: "32 min" },
                { icon: Star, label: "Rated by 24k+", value: "4.7 / 5" },
                { icon: ShieldCheck, label: "Free delivery", value: "Above ₹499" },
              ].map((stat) => (
                <div key={stat.label}>
                  <stat.icon className="mb-2 size-5 opacity-70" />
                  <dt className="text-xs opacity-60">{stat.label}</dt>
                  <dd className="text-lg font-bold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Categories */}
      <Section
        title="Browse by category"
        subtitle="Eight kitchens, one checkout"
        action={{ to: "/categories", label: "All categories" }}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {(categories ?? []).map((cat) => (
            <Link
              key={cat.id}
              to="/menu"
              search={{ category: cat.slug, q: undefined }}
              className="lift-on-hover group flex flex-col items-center gap-3"
            >
              <span className="ring-border group-hover:ring-primary size-20 overflow-hidden rounded-full ring-2 transition sm:size-24">
                <img
                  src={foodImage(cat.image_key)}
                  alt={cat.name}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="text-center text-sm font-semibold">{cat.name}</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Popular */}
      <Section title="Popular right now" subtitle="What Bengaluru is ordering today" action={{ to: "/menu", label: "See full menu" }}>
        <FoodGrid foods={popular} loading={isLoading} categoryName={categoryName} />
      </Section>

      {/* Offers */}
      {offers.length > 0 && (
        <Section title="Special offers" subtitle="Limited-time savings on kitchen favourites">
          <div className="grid gap-4 md:grid-cols-3">
            {offers.map((food) => (
              <Link
                key={food.id}
                to="/food/$slug"
                params={{ slug: food.slug }}
                className="gradient-dark lift-on-hover relative flex items-center gap-5 overflow-hidden rounded-2xl p-5 text-[oklch(0.97_0.01_140)]"
              >
                <img
                  src={foodImage(food.image_key)}
                  alt={food.name}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="size-24 shrink-0 rounded-xl object-cover"
                />
                <div>
                  <span className="bg-highlight text-brand-deep inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold">
                    <Percent className="size-3" /> {food.offer_percent}% off
                  </span>
                  <h3 className="mt-2 font-bold">{food.name}</h3>
                  <p className="mt-1 text-sm opacity-70">
                    {inr(discountedPrice(Number(food.price), food.offer_percent))}{" "}
                    <span className="line-through opacity-60">{inr(Number(food.price))}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Recommended */}
      <Section title="Recommended for you" subtitle="Hand-picked by our head chefs">
        <FoodGrid foods={recommended} loading={isLoading} categoryName={categoryName} />
      </Section>

      {/* Featured */}
      <Section title="Featured dishes" subtitle="A taste of the full BiteRush menu" action={{ to: "/menu", label: "Explore menu" }}>
        <FoodGrid foods={featured} loading={isLoading} categoryName={categoryName} />
      </Section>

      {/* Reviews */}
      <Section title="Loved by our customers" subtitle="Real reviews from BiteRush regulars">
        <div className="grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="surface-card flex h-full flex-col gap-4 p-6">
              <Quote className="text-brand-soft size-8" />
              <blockquote className="flex-1 text-sm leading-relaxed">{r.text}</blockquote>
              <figcaption className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-muted-foreground text-xs">{r.area}, Bengaluru</p>
                </div>
                <span className="text-highlight flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="fill-highlight size-3.5" />
                  ))}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6">
        <div className="gradient-brand text-primary-foreground flex flex-col items-start gap-6 rounded-3xl p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Hungry already? Your first order ships free.</h2>
            <p className="mt-2 max-w-xl text-sm opacity-90">
              Create a BiteRush account to save addresses, track live orders and reorder your favourites in a tap.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="h-12 rounded-full px-8">
            <Link to="/register">
              Create account <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: { to: "/menu" | "/categories"; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
        </div>
        {action && (
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to={action.to} search={{ q: undefined, category: undefined }}>
              {action.label} <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}

function FoodGrid({
  foods,
  loading,
  categoryName,
}: {
  foods: Food[];
  loading: boolean;
  categoryName: (id: string) => string | undefined;
}) {
  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-2xl" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {foods.map((food) => (
        <FoodCard key={food.id} food={food} categoryName={categoryName(food.category_id)} />
      ))}
    </div>
  );
}