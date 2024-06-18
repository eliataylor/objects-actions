###OBJECT-ACTIONS-MODEL_IMPORTS-STARTS###
from django.db import models
from django.contrib.auth.models import User
from django.contrib import admin
from django.utils import timezone
from django.contrib.auth import get_user_model
import re
from django.core.exceptions import ValidationError
from address.models import AddressField
from django.utils.text import slugify
from django.db.models.signals import pre_save
from django.dispatch import receiver
from djmoney.models.fields import MoneyField
###OBJECT-ACTIONS-MODEL_IMPORTS-ENDS###

###OBJECT-ACTIONS-PRE-HELPERS-STARTS###

def validate_phone_number(value):
                        phone_regex = re.compile(r'^\+?1?\d{9,15}$')
                        if not phone_regex.match(value):
                            raise ValidationError("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
###OBJECT-ACTIONS-PRE-HELPERS-ENDS###



###OBJECT-ACTIONS-MODELS-STARTS###
class SuperModel(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        abstract = True
        # verbose_name = 'My Model'  # Default: model's verbose name in singular form
        # verbose_name_plural = 'My Models'  # Default: model's verbose name in plural form
        # ordering = ['-created_at']  # Default: None, natural ordering by 'id'
        # permissions = ()  # Default: empty tuple, no permissions required
        # default_permissions = ('add', 'change', 'delete', 'view')  # Default: ('add', 'change', 'delete')
        # indexes = []  # Default: empty list, no indexes defined
        # constraints = []  # Default: empty list, no constraints defined
        # unique_together = []  # Default: empty list, no unique constraints
        # db_table = ''  # Default: empty string, auto-generated table name
        # abstract = False  # Default: False, not an abstract model
        # managed = True  # Default: True, table is managed by Django
        # app_label = 'myapp'  # Default: None, inferred from app's package name
        # default_related_name = None  # Default: None, no default related name
        # indexes = []  # Default: empty list, no indexes defined
        # ordering = ()  # Default: empty tuple, no ordering defined



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

class Customer(SuperModel):
    class Meta:
        abstract = False

    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(get_user_model(),  on_delete=models.CASCADE,  related_name='+', blank=True, null=True)
    phone = models.CharField(validators=[validate_phone_number], max_length=16)
    email = models.EmailField()
    billing_name = models.CharField(max_length=255, blank=True, null=True)
    billing_address = AddressField(related_name='+', blank=True, null=True)
    delivery_name = models.CharField(max_length=255, blank=True, null=True)
    delivery_address = AddressField(related_name='+', blank=True, null=True)


    ###SAVE_OVERRIDE###
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = slugify(self.title)
        super().save(*args, **kwargs)

class CustomerAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

admin.site.register(Customer, CustomerAdmin)

class Supplier(SuperModel):
    class Meta:
        abstract = False

    id = models.SlugField(primary_key=True, unique=True, editable=False)
    name = models.CharField(max_length=255)
    photo = models.ImageField(upload_to='media/suppliers', blank=True, null=True)
    address = AddressField(related_name='+', blank=True, null=True)
    website = models.URLField(blank=True, null=True)


    ###SAVE_OVERRIDE###
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = slugify(self.title)
        super().save(*args, **kwargs)

class SupplierAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

admin.site.register(Supplier, SupplierAdmin)

class Ingredient(SuperModel):
    class Meta:
        abstract = False

    id = models.SlugField(primary_key=True, unique=True, editable=False)
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to='media/ingredients', blank=True, null=True)
    supplier = models.ForeignKey('Supplier',  on_delete=models.CASCADE, blank=True, null=True)
    seasonal = models.BooleanField(blank=True, null=True)
    in_season_price = models.DecimalField(max_digits=10,  decimal_places=2, blank=True, null=True)
    out_of_season_price = models.DecimalField(max_digits=10,  decimal_places=2, blank=True, null=True)


    ###SAVE_OVERRIDE###
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = slugify(self.title)
        super().save(*args, **kwargs)

class IngredientAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

admin.site.register(Ingredient, IngredientAdmin)

class Meal(SuperModel):
    class Meta:
        abstract = False

    class BldChoices(models.TextChoices):
        breakfast = ("Breakfast", "breakfast")
        lunch = ("Lunch", "lunch")
        dinner = ("Dinner", "dinner")
        desert = ("Desert", "desert")
        snack = ("Snack", "snack")
    id = models.SlugField(primary_key=True, unique=True, editable=False)
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    bld = models.CharField(max_length=20, choices=BldChoices.choices)
    photo = models.FileField(upload_to='media/calendar')
    internal_cost = models.DecimalField(max_digits=10,  decimal_places=2, blank=True, null=True)
    public_price = models.DecimalField(max_digits=10,   decimal_places=2,  default=16, blank=True, null=True)
    ingredients = models.ManyToManyField('Ingredient', blank=True, null=True)
    suppliers = models.ManyToManyField('Supplier', blank=True, null=True)


    ###SAVE_OVERRIDE###
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = slugify(self.title)
        super().save(*args, **kwargs)

class MealAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

admin.site.register(Meal, MealAdmin)

class Plan(SuperModel):
    class Meta:
        abstract = False

    id = models.SlugField(primary_key=True, unique=True, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    meals = models.ManyToManyField('Meal')
    price = MoneyField(decimal_places=2,  default_currency='USD',  max_digits=11, blank=True, null=True)
    date = models.DateField(blank=True, null=True)


    ###SAVE_OVERRIDE###
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = slugify(self.title)
        super().save(*args, **kwargs)

class PlanAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

admin.site.register(Plan, PlanAdmin)

class OrderItem(SuperModel):
    class Meta:
        abstract = False

    id = models.AutoField(primary_key=True)
    date = models.DateField()
    delivery_date = models.DateField()
    meal = models.ForeignKey('Meal',  on_delete=models.CASCADE, blank=True, null=True)
    meal_menu = models.ForeignKey('Plan',  on_delete=models.CASCADE, blank=True, null=True)
    servings = models.IntegerField(default=1)


    ###SAVE_OVERRIDE###
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = slugify(self.title)
        super().save(*args, **kwargs)

class OrderItemAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

admin.site.register(OrderItem, OrderItemAdmin)

class Order(SuperModel):
    class Meta:
        abstract = False

    class StatusChoices(models.TextChoices):
        paid = ("Paid", "paid")
        cancelled = ("Cancelled", "cancelled")
        unpaid = ("Unpaid", "unpaid")
    id = models.AutoField(primary_key=True)
    customer = models.OneToOneField('Customer', on_delete=models.CASCADE, related_name='+')
    created_date = models.DateField()
    start_date = models.DateField()
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_instructions = models.TextField(blank=True, null=True)
    customizations = models.CharField(max_length=255)
    glass_containers = models.BooleanField(default="0", blank=True, null=True)
    recurring = models.BooleanField(default="0", blank=True, null=True)
    order_items = models.ManyToManyField('OrderItem')
    status = models.CharField(max_length=20,  default="unpaid", choices=StatusChoices.choices)


    ###SAVE_OVERRIDE###
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = slugify(self.title)
        super().save(*args, **kwargs)

class OrderAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

admin.site.register(Order, OrderAdmin)
###OBJECT-ACTIONS-MODELS-ENDS###



###OBJECT-ACTIONS-POST-HELPERS-STARTS###

@receiver(pre_save, sender=Supplier)
def generate_slug_supplier_id(sender, instance, **kwargs):
    if not instance.id:
        instance.id = slugify(instance.name)


@receiver(pre_save, sender=Ingredient)
def generate_slug_ingredient_id(sender, instance, **kwargs):
    if not instance.id:
        instance.id = slugify(instance.title)


@receiver(pre_save, sender=Meal)
def generate_slug_meal_id(sender, instance, **kwargs):
    if not instance.id:
        instance.id = slugify(instance.title)


@receiver(pre_save, sender=Plan)
def generate_slug_plan_id(sender, instance, **kwargs):
    if not instance.id:
        instance.id = slugify(instance.name)

###OBJECT-ACTIONS-POST-HELPERS-ENDS###





































































