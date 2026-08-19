import pizza from "@/assets/food-pizza.jpg";
import burger from "@/assets/food-burger.jpg";
import biryani from "@/assets/food-biryani.jpg";
import southindian from "@/assets/food-southindian.jpg";
import northindian from "@/assets/food-northindian.jpg";
import chinese from "@/assets/food-chinese.jpg";
import dessert from "@/assets/food-dessert.jpg";
import beverage from "@/assets/food-beverage.jpg";

export const FOOD_IMAGES: Record<string, string> = {
  pizza,
  burger,
  biryani,
  southindian,
  northindian,
  chinese,
  dessert,
  beverage,
};

export const IMAGE_KEYS = Object.keys(FOOD_IMAGES);

export function foodImage(key: string | null | undefined): string {
  return (key && FOOD_IMAGES[key]) || FOOD_IMAGES["pizza"]!;
}