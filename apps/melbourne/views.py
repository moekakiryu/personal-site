from django.shortcuts import render
from django.http import Http404
from django.db.models import F
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist

from apps.melbourne.models import Review
from utils.querysets import stratify

meals_order = [
    Review.MealTypes.BRUNCH,
    Review.MealTypes.LUNCH,
    Review.MealTypes.DINNER,
    Review.MealTypes.DESSERT,
    Review.MealTypes.SNACK,
]

def home(request, **kwargs):
  restaurants = Review.objects.all()

  meals = {meal: [] for meal in meals_order}
  for restaurant in restaurants:
    meals[restaurant.meal_type].append(restaurant)

  return render(request, 'melbourne/restaurants/index.html', {
    'meals': {
      meal: restaurants
        for meal, restaurants in meals.items()
        if len(restaurants)
    },
    'WaitTypes': Review.WaitTypes
  })
