import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SearchX } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodCard } from "@/components/site/FoodCard";
import { categoriesQuery, foodsQuery, matchesSearch } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type MenuSearch = { q?: string | undefined; category?: string | undefined };

export const Route = createFileRoute("/menu")({
  validateSearch: (search: Record<string, unknown>): MenuSearch => ({
    q: typeof search["q"] === "string" && search["q"] ? String(search["q"]).slice(0, 80) : undefined,
    category: typeof search["category"] === "string" && search["category"] ? String(search["category"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Menu — Pizza, Biryani, Burgers & More | BiteRush" },
      {
        name: "description",
        content: "Browse the full BiteRush menu: pizza, burgers, biryani, South Indian, Chinese, desserts and drinks.",
      },
      { property: "og:title", content: "The BiteRush Menu" },
      { property: "og:description", content: "Search and filter 32 chef-made dishes delivered across Bengaluru." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { q, category } = Route.useSearch();
  const navigate = useNavigate({ from: "/menu" });
  const { data: categories } = useQuery(categoriesQuery);
  const { data: foods, isLoading } = useQuery(foodsQuery);

  const nameById = (id: string) => categories?.find((c) => c.id === id)?.name ?? "";
  const activeCategory = categories?.find((c) => c.slug === category);

  const results = (foods ?? []).filter((food) => {
    if (activeCategory && food.category_id !== activeCategory.id) return false;
    return matchesSearch(food, q ?? "", nameById(food.category_id));
  });

  function setSearch(next: MenuSearch) {
    void navigate({ search: (prev: MenuSearch) => ({ ...prev, ...next }) });
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Our menu</h1>
        <p className="text-muted-foreground mt-2">
          {results.length} dish{results.length === 1 ? "" : "es"} available right now from BiteRush kitchens.
        </p>
      </header>

      <div className="relative mt-6 max-w-xl">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" />
        <Input
          value={q ?? ""}
          onChange={(e) => setSearch({ q: e.target.value || undefined })}
          placeholder="Search by dish, ingredient or category…"
          aria-label="Search the menu"
          className="h-13 rounded-full pl-12"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <CategoryChip active={!category} onClick={() => setSearch({ category: undefined })} label="All" />
        {(categories ?? []).map((cat) => (
          <CategoryChip
            key={cat.id}
            active={category === cat.slug}
            onClick={() => setSearch({ category: cat.slug })}
            label={cat.name}
          />
        ))}
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="surface-card flex flex-col items-center gap-3 px-6 py-20 text-center">
            <SearchX className="text-muted-foreground size-10" />
            <h2 className="text-lg font-bold">No dishes matched your search</h2>
            <p className="text-muted-foreground max-w-sm text-sm">
              We couldn't find anything for “{q}”. Try a different dish, ingredient or clear the filters.
            </p>
            <Button className="mt-2 rounded-full" onClick={() => setSearch({ q: undefined, category: undefined })}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((food) => (
              <FoodCard key={food.id} food={food} categoryName={nameById(food.category_id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}