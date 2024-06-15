import re
from django.core.exceptions import ValidationError
from address.models import AddressField
from djmoney.models.fields import MoneyField
from django.db import models
from django.contrib.auth.models import User
from django.contrib import admin
from django.utils import timezone
from django.contrib.auth import get_user_model
class SuperModel(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        abstract = True
    def __str__(self):
        if hasattr(self, "title"):
            return self.title
        elif hasattr(self, "name"):
            return self.name
        return self.__class__


    def get_current_user(self, request):
        if hasattr(request, 'user') and request.user.is_authenticated:
            return request.user
        return None
    def save(self, *args, **kwargs):
        if not self.id and hasattr(self, 'author') and not self.author_id:
            request = kwargs.pop('request', None)  # Remove 'request' from kwargs
            if request:
                self.author = self.get_current_user(request)
        super().save(*args, **kwargs)
def validate_phone_number(value):
    phone_regex = re.compile(r'^\+?1?\d{9,15}$')
    if not phone_regex.match(value):
        raise ValidationError("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")


class BldChoices(models.TextChoices):
	breakfast = ("Breakfast", "breakfast")
	lunch = ("Lunch", "lunch")
	dinner = ("Dinner", "dinner")
	desert = ("Desert", "desert")
	snack = ("Snack", "snack")


class StatusChoices(models.TextChoices):
	paid = ("Paid", "paid")
	cancelled = ("Cancelled", "cancelled")
	unpaid = ("Unpaid", "unpaid")

class Customer(SuperModel):
    user_id = models.TextField(blank=True, null=True)
    phone = models.CharField(validators=[validate_phone_number], max_length=16)
    email = models.EmailField()
    billing_name = models.CharField(max_length=255, blank=True, null=True)
    billing_address = AddressField(related_name='+', blank=True, null=True)
    delivery_name = models.CharField(max_length=255, blank=True, null=True)
    delivery_address = AddressField(related_name='+', blank=True, null=True)
admin.site.register(Customer)

class Supplier(SuperModel):
    slug = models.SlugField(unique=True,  max_length=100, blank=True, null=True)
    name = models.CharField(max_length=255)
    photo = models.ImageField(blank=True, null=True)
    address = AddressField(related_name='+', blank=True, null=True)
    website = models.URLField(blank=True, null=True)
admin.site.register(Supplier)

class Ingredient(SuperModel):
    title = models.CharField(max_length=255)
    image = models.ImageField(blank=True, null=True)
    supplier = models.ForeignKey('Supplier',  on_delete=models.CASCADE, blank=True, null=True)
    seasonal = models.BooleanField(blank=True, null=True)
    in_season_price = models.DecimalField(max_digits=10,  decimal_places=2, blank=True, null=True)
    out_of_season_price = models.DecimalField(max_digits=10,  decimal_places=2, blank=True, null=True)
admin.site.register(Ingredient)

class Meal(SuperModel):
    slug = models.SlugField(unique=True,  max_length=100, blank=True, null=True)
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    bld = models.CharField(max_length=20, choices=BldChoices.choices)
    photo = models.FileField(upload_to='media/')
    internal_cost = models.DecimalField(max_digits=10,  decimal_places=2, blank=True, null=True)
    public_price = models.DecimalField(max_digits=10,   decimal_places=2,  blank=True,  null=True, default=16)
    ingredients = models.ForeignKey('Ingredient',  on_delete=models.CASCADE, blank=True, null=True)
    suppliers = models.ForeignKey('Supplier',  on_delete=models.CASCADE, blank=True, null=True)
admin.site.register(Meal)

class Plan(SuperModel):
    slug = models.SlugField(unique=True, max_length=100)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    meals = models.ForeignKey('Meal', on_delete=models.CASCADE)
    price = MoneyField(decimal_places=2,  default_currency='USD',  max_digits=11, blank=True, null=True)
    date = models.DateField(blank=True, null=True)
admin.site.register(Plan)

class OrderItem(SuperModel):
    date = models.DateField()
    delivery_date = models.DateField()
    meal = models.ForeignKey('Meal',  on_delete=models.CASCADE, blank=True, null=True)
    meal_menu = models.ForeignKey('Plan',  on_delete=models.CASCADE, blank=True, null=True)
    servings = models.IntegerField(default=1)
admin.site.register(OrderItem)

class Order(SuperModel):
    customer = models.TextField()
    created_date = models.DateField()
    start_date = models.DateField()
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_instructions = models.TextField(blank=True, null=True)
    customizations = models.CharField(max_length=255)
    glass_containers = models.BooleanField(blank=True,  null=True, default="0")
    recurring = models.BooleanField(blank=True,  null=True, default="0")
    order_items = models.ForeignKey('OrderItem', on_delete=models.CASCADE)
    status = models.CharField(max_length=20,  default="unpaid", choices=StatusChoices.choices)
admin.site.register(Order)
