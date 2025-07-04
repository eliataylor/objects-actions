# Django Backend Performance Optimizations

Based on the analysis of your Django views and models, here are key optimizations to implement:

## 1. Database Query Optimizations

### Add `select_related` and `prefetch_related` to ViewSets
```python
# In your ViewSets, add optimized querysets:
class ResourcesViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Resources.objects.select_related('author', 'category').prefetch_related('tags')
    
class CitiesViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Cities.objects.select_related('state', 'author')
```

### Add Database Indexes
```python
# Add to your models.py
class Resources(models.Model):
    title = models.CharField(max_length=200, db_index=True)  # For search
    author = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)  # For ordering
    
    class Meta:
        indexes = [
            models.Index(fields=['title', 'created_at']),  # Composite index for search + order
            models.Index(fields=['author', '-created_at']),  # User resources by date
        ]
```

## 2. Caching Optimizations

### Add Redis Caching
```python
# settings/cache.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Cache frequently accessed data
from django.core.cache import cache

class ResourcesViewSet(viewsets.ModelViewSet):
    def list(self, request, *args, **kwargs):
        cache_key = f"resources_list_{request.GET.urlencode()}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return Response(cached_result)
            
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, 300)  # 5 minutes
        return response
```

## 3. Permission Optimization

### Cache Permission Checks
```python
from functools import lru_cache

class BaseViewSet(viewsets.ModelViewSet):
    @lru_cache(maxsize=128)
    def _get_user_permissions(self, user_id, action):
        """Cache permission checks per user/action"""
        user = User.objects.get(id=user_id)
        return user.groups.filter(name='IsAdmin').exists()
    
    def get_permissions(self):
        if self.request.user.is_authenticated:
            has_admin = self._get_user_permissions(self.request.user.id, self.action)
            # Use cached result for permission logic
```

## 4. Pagination Optimization

### Use `count_estimated` for Large Tables
```python
class FastPagination(PageNumberPagination):
    def get_count(self, queryset):
        # For very large tables, use estimated count
        if queryset.model._meta.db_table in ['resources', 'cities']:
            with connection.cursor() as cursor:
                cursor.execute(f"SELECT reltuples::bigint FROM pg_class WHERE relname = '{queryset.model._meta.db_table}'")
                return int(cursor.fetchone()[0])
        return super().get_count(queryset)
```

## 5. Search Optimization

### Use PostgreSQL Full-Text Search
```python
from django.contrib.postgres.search import SearchVector, SearchQuery

class ResourcesViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        
        if search:
            # Use PostgreSQL full-text search instead of icontains
            search_vector = SearchVector('title', 'description')
            search_query = SearchQuery(search)
            queryset = queryset.annotate(
                search=search_vector
            ).filter(search=search_query)
            
        return queryset
```

## 6. Aggregation Optimization

### Optimize States.update_aggregations()
```python
class States(models.Model):
    def update_aggregations(self):
        # Use single query with all aggregations
        from django.db.models import Sum, Avg, Count, Max, Min
        
        aggregates = Cities.objects.filter(state_id=self).aggregate(
            count=Count('id'),
            total_pop=Sum('population'),
            avg_pop=Avg('population'),
            max_pop=Max('population'),
            min_pop=Min('population'),
            largest_city_id=Max('id', filter=Q(population=Max('population'))),
            smallest_city_id=Min('id', filter=Q(population=Min('population')))
        )
        
        # Update all fields in single query
        States.objects.filter(id=self.id).update(
            city_count=aggregates['count'] or 0,
            total_city_population=aggregates['total_pop'] or 0,
            avg_city_population=int(aggregates['avg_pop'] or 0),
            largest_city_id=aggregates['largest_city_id'],
            smallest_city_id=aggregates['smallest_city_id']
        )
```

## 7. Connection Pool Optimization

### Add to settings/database.py
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'MAX_CONNS': 20,
            'OPTIONS': {
                'MAX_CONNS': 20,
            }
        },
        'CONN_MAX_AGE': 600,  # Connection pooling
    }
}
```

## Next Steps:
1. Implement database indexes first (biggest impact)
2. Add `select_related` to your ViewSets
3. Add Redis caching for frequently accessed data
4. Profile your queries with Django Debug Toolbar
5. Monitor with `python manage.py dbshell` and `EXPLAIN ANALYZE` 