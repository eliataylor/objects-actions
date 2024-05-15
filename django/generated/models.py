###OBJECT-ACTIONS-MODELS-STARTS###

class Customer(SuperModel):
    user_id = models.TextField(blank=True, null=True)
    email = models.TextField()
    billing_name = models.CharField(max_length=255, blank=True, null=True)
    billing_address = models.CharField(max_length=2555, blank=True, null=True)
    delivery_name = models.CharField(max_length=255, blank=True, null=True)
    delivery_address = models.CharField(max_length=2555, blank=True, null=True)
admin.site.register(Customer)

class Supplier(SuperModel):
    name = models.CharField(max_length=255)
    photo = models.ImageField(blank=True, null=True)
    address = models.CharField(max_length=2555, blank=True, null=True)
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
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    bld = models.CharField(max_length=20, choices=MealTimes.choices)
    photo = models.FileField(upload_to='media/')
    internal_cost = models.DecimalField(max_digits=10,  decimal_places=2, blank=True, null=True)
    public_price = models.DecimalField(max_digits=10,   decimal_places=2,  blank=True,  null=True, default=16)
    ingredients = models.ForeignKey('Ingredient',  on_delete=models.CASCADE, blank=True, null=True)
    suppliers = models.ForeignKey('Supplier',  on_delete=models.CASCADE, blank=True, null=True)
admin.site.register(Meal)

class OrderItems(SuperModel):
    date = models.DateField()
    delivery_date = models.DateField()
    meal = models.ForeignKey('Meal',  on_delete=models.CASCADE, blank=True, null=True)
    servings = models.IntegerField(default=1)
admin.site.register(OrderItems)

class Plan(SuperModel):
    customer = models.TextField()
    created_date = models.DateField()
    start_date = models.DateField()
    customizations = models.CharField(max_length=255)
    glass_containers = models.BooleanField(blank=True,  null=True, default=0)
    order_items = models.ForeignKey('OrderItems', on_delete=models.CASCADE)
admin.site.register(Plan)

class Order(SuperModel):
    plan = models.ForeignKey('Plan', on_delete=models.CASCADE)
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    recurring = models.BooleanField(blank=True,  null=True, default=0)
    delivery_instructions = models.TextField(blank=True, null=True)
admin.site.register(Order)

###OBJECT-ACTIONS-MODELS-ENDS###