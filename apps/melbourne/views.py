from django.shortcuts import render
from django.db.models import F

from apps.melbourne.models import Restaurant

meals_order = [
    Restaurant.MealTypes.BRUNCH,
    Restaurant.MealTypes.LUNCH,
    Restaurant.MealTypes.DINNER,
    Restaurant.MealTypes.DESSERT,
    Restaurant.MealTypes.SNACK,
    Restaurant.MealTypes.BAR,
]

def home(request, **kwargs):
  restaurants = Restaurant.objects.all().order_by(F('order').asc(nulls_last=True))

  meals = {meal: [] for meal in meals_order}
  for restaurant in restaurants:
    meals[restaurant.meal_type].append(restaurant)

  return render(request, 'melbourne/restaurants/index.html', {
    'meals': {
      meal: restaurants
        for meal, restaurants in meals.items()
        if len(restaurants)
    },
    'WaitTypes': Restaurant.WaitTypes
  })
