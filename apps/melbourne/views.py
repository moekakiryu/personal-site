from django.shortcuts import render
from django.http import Http404
from django.db.models import F
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist

from apps.melbourne.models import Restaurant
from utils.querysets import stratify

meals_order = [
    Restaurant.MealTypes.BRUNCH,
    Restaurant.MealTypes.LUNCH,
    Restaurant.MealTypes.DINNER,
    Restaurant.MealTypes.DESSERT,
    Restaurant.MealTypes.SNACK,
    Restaurant.MealTypes.BAR,
]

def home(request, **kwargs):
  restaurants = Restaurant.objects.all().order_by('-order')

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
