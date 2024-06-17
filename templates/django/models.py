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