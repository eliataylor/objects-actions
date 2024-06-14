###OBJECT-ACTIONS-MODELS-STARTS###"
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
        

class Customer(SuperModel):
    user_id = models.TextField(blank=True, null=True)
    email = models.EmailField()
    billing_name = models.CharField(max_length=255, blank=True, null=True)
    billing_address = AddressField(blank=True, null=True)
    delivery_name = models.CharField(max_length=255, blank=True, null=True)
    delivery_address = AddressField(blank=True, null=True)
admin.site.register(Customer)

class Supplier(SuperModel):
    slug = models.TextField(blank=True, null=True)
    name = models.CharField(max_length=255)
    photo = models.ImageField(blank=True, null=True)
    address = AddressField(blank=True, null=True)
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
    slug = models.TextField(blank=True, null=True)
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    bld = models.CharField(max_length=20, choices=MealTimes.choices)
    photo = models.FileField(upload_to='media/')
    internal_cost = models.DecimalField(max_digits=10,  decimal_places=2, blank=True, null=True)
    public_price = models.DecimalField(max_digits=10,   decimal_places=2,  blank=True,  null=True, default=16)
    ingredients = models.ForeignKey('Ingredient',  on_delete=models.CASCADE, blank=True, null=True)
    suppliers = models.ForeignKey('Supplier',  on_delete=models.CASCADE, blank=True, null=True)
admin.site.register(Meal)

class Plan(SuperModel):
    slug = models.TextField()
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    meals = models.ForeignKey('Meal', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10,  decimal_places=2, blank=True, null=True)
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
    glass_containers = models.BooleanField(blank=True,  null=True, default=0)
    recurring = models.BooleanField(blank=True,  null=True, default=0)
    order_items = models.ForeignKey('OrderItem', on_delete=models.CASCADE)
    status = models.CharField(max_length=20,  choices=MealTimes.choices, default=unpaid)
admin.site.register(Order)
###OBJECT-ACTIONS-MODELS-ENDS###