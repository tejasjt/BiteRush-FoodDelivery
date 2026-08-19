# Feast Finder

Create a modern, professional and fully responsive real-world food delivery website.

I do NOT want a portfolio website, resume website, personal website or developer portfolio.

I want this to look like an actual commercial food-ordering platform that customers could use to browse restaurants/food items and place orders.

The website should have a polished design similar to modern food delivery platforms, while having its own unique branding and UI.

Before building the final website, ask me any questions you need about the business name, logo, colors, food categories, restaurant information, images, payment method and other important details. Do not invent important business information if clarification is needed.

Website Concept

Build an online food ordering platform where users can:

Browse food items

Search for food

Filter food by category

View food details

Add food to cart

Change quantities

Remove items from cart

View cart total

Enter delivery information

Place an order

View order confirmation

View previous orders

Manage their account

The website should feel like a real production application rather than a college project.

Main Pages

Create:

Home

Menu

Food Details

Categories

Cart

Checkout

Order Confirmation

My Orders

Login

Register

User Profile

About

Contact

Home Page

Create an attractive food-delivery homepage.

Include:

Large hero section

Food search bar

"What are you craving?" heading

Food categories

Popular dishes

Recommended dishes

Special offers

Featured food items

Customer reviews

Call-to-action section

Professional footer

Use attractive food imagery.

The homepage should immediately look like a real food-delivery business.

Menu

Create a professional menu page.

Include categories such as:

Pizza

Burgers

Biryani

South Indian

North Indian

Chinese

Desserts

Beverages

Each category should display food cards.

Each food card should contain:

Food image

Food name

Short description

Price

Rating

Category

Add to Cart button

Make the category system easy to modify later.

Search

Add a functional search bar.

Users should be able to search food by:

Food name

Category

Description

Show an appropriate message when no food is found.

Food Details

When a user selects a food item, show:

Large food image

Food name

Description

Price

Rating

Ingredients

Quantity selector

Add to Cart

Related food items

Cart

Create a fully functional shopping cart.

Users should be able to:

Increase quantity

Decrease quantity

Remove items

See item subtotal

See delivery fee

See total amount

Add a professional checkout button.

Checkout

Create a clean checkout page.

Include:

Customer name

Phone number

Delivery address

City

Pincode

Order summary

Total amount

Payment method

For now, use a safe mock payment flow if a real payment gateway has not been configured.

Do not claim that real payments are processed unless a real payment gateway is implemented.

Authentication

Create:

Register

Name

Email

Phone

Password

Confirm password

Login

Email

Password

Include proper validation and useful error messages.

User Account

Create a user dashboard where customers can:

View profile

Update profile

View orders

View order details

Logout

Orders

Create an order history page.

Each order should show:

Order ID

Date

Items

Total

Order status

Use statuses such as:

Order Placed

Preparing

Out for Delivery

Delivered

Cancelled

Create a visually attractive order tracking interface.

Admin

Create an admin dashboard because this project should demonstrate my Java Full Stack knowledge.

Admin should be able to:

Add food

Edit food

Delete food

Upload food images

Manage categories

View customers

View orders

Update order status

Manage inventory

Create a professional admin dashboard with:

Statistics

Total orders

Total customers

Total food items

Revenue

Recent orders

Backend

Use:

Java

Spring Boot

Spring MVC

Spring Data JPA

Hibernate

REST APIs

MySQL

Use proper layered architecture:

Controller
→ Service
→ Repository
→ Database

Create clean entity relationships and proper DTOs where appropriate.

Database

Use MySQL.

Create suitable entities such as:

User

Food

Category

Cart

CartItem

Order

OrderItem

Address

Use proper JPA relationships.

Do not create unnecessary tables.

Frontend

Use:

HTML

CSS

JavaScript

Thymeleaf

If React is more appropriate for the frontend architecture, ask me before changing the technology stack.

Design

The website must look:

Modern

Professional

Clean

Premium

Responsive

Fast

User-friendly

Use:

Attractive food images

Modern cards

Professional typography

Smooth animations

Hover effects

Proper spacing

Sticky navigation

Mobile navigation

Responsive food grids

Modern buttons

Toast notifications

Loading states

Empty states

Do not make it look like a basic student CRUD project.

Responsive Design

The website must work properly on:

Desktop

Laptop

Tablet

Mobile

On mobile:

Use hamburger navigation

Stack food cards

Make buttons touch-friendly

Keep cart accessible

Prevent horizontal scrolling

Make checkout easy to use

Branding

Create a unique professional brand identity.

Do not use an existing company's logo, name or exact design.

Use an original food-delivery brand name after asking me what name I want.

Code Quality

Use:

Clean architecture

Reusable components/templates

Meaningful variable names

Proper validation

Error handling

Secure password handling

Clean database design

Responsive CSS

No unnecessary dependencies

Do not hard-code important business data.

Make food, categories and other data easy to manage through the application.

Final Requirements

After creating the website:

Run the application.

Fix compilation errors.

Fix runtime errors.

Check database connectivity.

Check all pages.

Test login/register.

Test food search.

Test cart.

Test checkout.

Test order creation.

Test admin functions.

Test mobile responsiveness.

Check browser console errors.

Make the UI polished.

Explain how to run the application locally.

Explain how to configure MySQL.

Prepare the project for deployment.

The final result should look like a real food-delivery business website, not a portfolio and not a simple college project.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://savory-send-now.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4e6c99e6-a98a-4a2e-9d91-31055eb76ba1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
