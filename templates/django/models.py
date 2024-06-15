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