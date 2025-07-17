from rest_framework.pagination import LimitOffsetPagination
from django.http import JsonResponse


class CustomLimitOffsetPagination(LimitOffsetPagination):
    """
    Custom pagination class that includes limit and offset in the response.
    This matches the expected format in the frontend types.
    """
    
    def get_paginated_response(self, data):
        return JsonResponse({
            'count': self.count,
            'limit': self.limit,
            'offset': self.offset,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        }) 