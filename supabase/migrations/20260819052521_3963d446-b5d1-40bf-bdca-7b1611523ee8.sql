
CREATE TYPE public.app_role AS ENUM ('admin','customer');
CREATE TYPE public.order_status AS ENUM ('placed','preparing','out_for_delivery','delivered','cancelled');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name',''),
          COALESCE(NEW.email,''),
          COALESCE(NEW.raw_user_meta_data->>'phone',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id,'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image_key TEXT NOT NULL DEFAULT 'pizza',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- foods
CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  image_key TEXT NOT NULL DEFAULT 'pizza',
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  is_veg BOOLEAN NOT NULL DEFAULT true,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_recommended BOOLEAN NOT NULL DEFAULT false,
  offer_percent INT NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 50,
  prep_minutes INT NOT NULL DEFAULT 25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.foods TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.foods TO authenticated;
GRANT ALL ON public.foods TO service_role;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Foods are public" ON public.foods FOR SELECT USING (true);
CREATE POLICY "Admins manage foods" ON public.foods FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER foods_updated BEFORE UPDATE ON public.foods FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- orders
CREATE SEQUENCE public.order_code_seq START 1041;
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_code TEXT NOT NULL UNIQUE DEFAULT ('BR-' || nextval('public.order_code_seq')),
  status public.order_status NOT NULL DEFAULT 'placed',
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users cancel own orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  food_id UUID REFERENCES public.foods(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  image_key TEXT NOT NULL DEFAULT 'pizza',
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "Users create own order items" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE INDEX idx_foods_category ON public.foods(category_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- seed categories
INSERT INTO public.categories (name, slug, image_key, sort_order) VALUES
 ('Pizza','pizza','pizza',1),
 ('Burgers','burgers','burger',2),
 ('Biryani','biryani','biryani',3),
 ('South Indian','south-indian','southindian',4),
 ('North Indian','north-indian','northindian',5),
 ('Chinese','chinese','chinese',6),
 ('Desserts','desserts','dessert',7),
 ('Beverages','beverages','beverage',8);

INSERT INTO public.foods (category_id, name, slug, description, price, rating, image_key, ingredients, is_veg, is_popular, is_recommended, offer_percent, prep_minutes) VALUES
 ((SELECT id FROM public.categories WHERE slug='pizza'),'Margherita Classic','margherita-classic','San Marzano tomato, fresh mozzarella and hand-torn basil on a 24-hour fermented base.',299,4.6,'pizza',ARRAY['Sourdough base','San Marzano tomato','Mozzarella','Basil','Olive oil'],true,true,true,10,22),
 ((SELECT id FROM public.categories WHERE slug='pizza'),'Peri Peri Paneer Pizza','peri-peri-paneer-pizza','Smoky peri peri paneer, roasted peppers and red onion with a chilli-honey drizzle.',399,4.5,'pizza',ARRAY['Paneer','Peri peri masala','Bell peppers','Red onion','Mozzarella'],true,true,false,0,25),
 ((SELECT id FROM public.categories WHERE slug='pizza'),'Chicken Tikka Pizza','chicken-tikka-pizza','Tandoori chicken tikka, onions and mint mayo on a cheesy hand-tossed crust.',449,4.7,'pizza',ARRAY['Chicken tikka','Onion','Mint mayo','Mozzarella','Coriander'],false,false,true,15,28),
 ((SELECT id FROM public.categories WHERE slug='pizza'),'Truffle Mushroom Pizza','truffle-mushroom-pizza','Button and shiitake mushrooms, truffle oil and parmesan on a thin crust.',479,4.4,'pizza',ARRAY['Mushrooms','Truffle oil','Parmesan','Mozzarella','Thyme'],true,false,false,0,26),
 ((SELECT id FROM public.categories WHERE slug='burgers'),'BiteRush Signature Burger','biterush-signature-burger','Double smashed patty, aged cheddar, house burger sauce and crisp lettuce.',329,4.8,'burger',ARRAY['Smashed patty','Aged cheddar','Burger sauce','Lettuce','Brioche bun'],false,true,true,10,18),
 ((SELECT id FROM public.categories WHERE slug='burgers'),'Crispy Paneer Burger','crispy-paneer-burger','Golden crumb-fried paneer, tandoori mayo and pickled onions.',249,4.4,'burger',ARRAY['Paneer','Tandoori mayo','Pickled onion','Lettuce','Sesame bun'],true,true,false,0,16),
 ((SELECT id FROM public.categories WHERE slug='burgers'),'Smoky BBQ Chicken Burger','smoky-bbq-chicken-burger','Grilled chicken thigh, smoked BBQ glaze, cheddar and crispy onions.',299,4.6,'burger',ARRAY['Chicken thigh','BBQ glaze','Cheddar','Crispy onion','Brioche bun'],false,false,true,0,20),
 ((SELECT id FROM public.categories WHERE slug='burgers'),'Loaded Cheese Fries','loaded-cheese-fries','Skin-on fries drowned in cheddar sauce, jalapenos and herb seasoning.',179,4.3,'burger',ARRAY['Potato fries','Cheddar sauce','Jalapeno','Herb seasoning'],true,false,false,0,12),
 ((SELECT id FROM public.categories WHERE slug='biryani'),'Hyderabadi Chicken Dum Biryani','hyderabadi-chicken-dum-biryani','Long-grain basmati layered with marinated chicken, saffron and fried onions.',379,4.9,'biryani',ARRAY['Basmati rice','Chicken','Saffron','Fried onion','Whole spices','Mint'],false,true,true,15,35),
 ((SELECT id FROM public.categories WHERE slug='biryani'),'Mutton Kacchi Biryani','mutton-kacchi-biryani','Slow-cooked mutton on the bone, sealed and dum-cooked with aged basmati.',499,4.8,'biryani',ARRAY['Mutton','Basmati rice','Yogurt marinade','Saffron','Ghee'],false,true,false,0,45),
 ((SELECT id FROM public.categories WHERE slug='biryani'),'Paneer Tikka Biryani','paneer-tikka-biryani','Char-grilled paneer tikka folded into fragrant biryani rice.',329,4.5,'biryani',ARRAY['Paneer','Basmati rice','Yogurt','Biryani masala','Mint'],true,false,true,0,30),
 ((SELECT id FROM public.categories WHERE slug='biryani'),'Egg Biryani','egg-biryani','Spiced boiled eggs layered with masala rice and served with raita.',249,4.3,'biryani',ARRAY['Egg','Basmati rice','Onion','Biryani masala','Raita'],false,false,false,0,28),
 ((SELECT id FROM public.categories WHERE slug='south-indian'),'Masala Dosa','masala-dosa','Crisp fermented crepe with spiced potato filling, chutney and sambar.',149,4.7,'southindian',ARRAY['Rice batter','Potato masala','Coconut chutney','Sambar','Curry leaves'],true,true,true,0,18),
 ((SELECT id FROM public.categories WHERE slug='south-indian'),'Idli Vada Combo','idli-vada-combo','Two steamed idlis and a crisp medu vada with sambar and chutneys.',129,4.4,'southindian',ARRAY['Idli','Medu vada','Sambar','Coconut chutney'],true,false,false,0,15),
 ((SELECT id FROM public.categories WHERE slug='south-indian'),'Ghee Podi Dosa','ghee-podi-dosa','Dosa smeared with ghee and spicy gunpowder podi.',169,4.6,'southindian',ARRAY['Rice batter','Ghee','Podi masala','Chutney'],true,true,false,0,18),
 ((SELECT id FROM public.categories WHERE slug='south-indian'),'Andhra Chicken Curry','andhra-chicken-curry','Fiery Andhra-style chicken curry served with rice or parotta.',329,4.5,'southindian',ARRAY['Chicken','Guntur chilli','Onion','Curry leaves','Coconut'],false,false,true,0,30),
 ((SELECT id FROM public.categories WHERE slug='north-indian'),'Butter Chicken','butter-chicken','Tandoori chicken simmered in a silky tomato-cashew makhani gravy.',379,4.8,'northindian',ARRAY['Chicken','Tomato','Cashew','Cream','Kasuri methi'],false,true,true,10,28),
 ((SELECT id FROM public.categories WHERE slug='north-indian'),'Paneer Butter Masala','paneer-butter-masala','Soft paneer cubes in a rich, mildly sweet makhani gravy.',329,4.6,'northindian',ARRAY['Paneer','Tomato','Butter','Cream','Garam masala'],true,true,false,0,25),
 ((SELECT id FROM public.categories WHERE slug='north-indian'),'Dal Makhani','dal-makhani','Black lentils slow-cooked overnight with butter and cream.',269,4.5,'northindian',ARRAY['Black urad dal','Rajma','Butter','Cream','Ginger'],true,false,true,0,24),
 ((SELECT id FROM public.categories WHERE slug='north-indian'),'Tandoori Roti Basket','tandoori-roti-basket','Four clay-oven rotis brushed with ghee.',99,4.2,'northindian',ARRAY['Wheat flour','Ghee'],true,false,false,0,12),
 ((SELECT id FROM public.categories WHERE slug='chinese'),'Chilli Paneer Hakka Noodles','chilli-paneer-hakka-noodles','Wok-tossed noodles with chilli paneer, peppers and spring onion.',279,4.5,'chinese',ARRAY['Noodles','Paneer','Bell pepper','Soy sauce','Spring onion'],true,true,true,0,20),
 ((SELECT id FROM public.categories WHERE slug='chinese'),'Chicken Manchurian','chicken-manchurian','Crispy chicken tossed in a glossy garlic-manchurian sauce.',319,4.6,'chinese',ARRAY['Chicken','Garlic','Soy sauce','Chilli','Cornflour'],false,true,false,0,22),
 ((SELECT id FROM public.categories WHERE slug='chinese'),'Veg Schezwan Fried Rice','veg-schezwan-fried-rice','Fiery schezwan fried rice with crunchy garden vegetables.',229,4.3,'chinese',ARRAY['Rice','Schezwan sauce','Carrot','Cabbage','Beans'],true,false,false,0,18),
 ((SELECT id FROM public.categories WHERE slug='chinese'),'Crispy Chilli Potato','crispy-chilli-potato','Honey-chilli glazed crisp potato batons with sesame.',189,4.4,'chinese',ARRAY['Potato','Honey','Chilli sauce','Sesame','Spring onion'],true,false,true,0,15),
 ((SELECT id FROM public.categories WHERE slug='desserts'),'Molten Chocolate Lava Cake','molten-chocolate-lava-cake','Warm dark chocolate cake with a flowing centre and vanilla scoop.',199,4.8,'dessert',ARRAY['Dark chocolate','Butter','Egg','Vanilla ice cream'],false,true,true,0,14),
 ((SELECT id FROM public.categories WHERE slug='desserts'),'Gulab Jamun (2 pcs)','gulab-jamun','Warm khoya dumplings soaked in cardamom sugar syrup.',119,4.6,'dessert',ARRAY['Khoya','Sugar syrup','Cardamom','Rose water'],true,true,false,0,10),
 ((SELECT id FROM public.categories WHERE slug='desserts'),'Tiramisu Jar','tiramisu-jar','Espresso-soaked savoiardi layered with mascarpone cream.',249,4.7,'dessert',ARRAY['Mascarpone','Espresso','Savoiardi','Cocoa'],true,false,true,10,12),
 ((SELECT id FROM public.categories WHERE slug='desserts'),'Sizzling Brownie','sizzling-brownie','Walnut brownie on a hot plate with chocolate sauce and ice cream.',229,4.5,'dessert',ARRAY['Brownie','Walnut','Chocolate sauce','Vanilla ice cream'],true,false,false,0,15),
 ((SELECT id FROM public.categories WHERE slug='beverages'),'Masala Chai Latte','masala-chai-latte','Slow-brewed Assam tea with ginger, cardamom and steamed milk.',99,4.5,'beverage',ARRAY['Assam tea','Ginger','Cardamom','Milk'],true,true,false,0,8),
 ((SELECT id FROM public.categories WHERE slug='beverages'),'Alphonso Mango Lassi','alphonso-mango-lassi','Thick curd blended with Alphonso mango pulp and saffron.',149,4.7,'beverage',ARRAY['Curd','Alphonso mango','Sugar','Saffron'],true,true,true,0,7),
 ((SELECT id FROM public.categories WHERE slug='beverages'),'Cold Brew Coffee','cold-brew-coffee','16-hour steeped Chikmagalur beans served over ice.',159,4.4,'beverage',ARRAY['Arabica coffee','Ice','Water'],true,false,true,0,6),
 ((SELECT id FROM public.categories WHERE slug='beverages'),'Fresh Lime Soda','fresh-lime-soda','Hand-squeezed lime, soda and a pinch of black salt.',89,4.2,'beverage',ARRAY['Lime','Soda','Black salt','Sugar'],true,false,false,0,5);
