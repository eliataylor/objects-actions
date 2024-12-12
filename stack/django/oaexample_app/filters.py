import django_filters
from django_filters import rest_framework as filters
from .models import Venues

class VenuesFilter(filters.FilterSet):
    class Meta:
        model = Venues
        fields = []  # We're not using predefined fields but defining custom logic

    def filter_queryset(self, request, queryset, view):
        user = request.user
        if user.is_authenticated:
            # Apply custom filter logic
            queryset = queryset.filter(
                models.Q(privacy='public') |
                models.Q(author=user) |
                models.Q(managers=user)
            )
        return queryset