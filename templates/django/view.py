class __CLASSNAME__ViewSet(viewsets.ModelViewSet):
    queryset = __CLASSNAME__.objects.all()
    serializer_class = __CLASSNAME__Serializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = __CLASSNAME__.objects.all()
        title = self.request.query_params.get('__TITLEFIELD__', None)
        if title is not None:
            queryset = queryset.filter(__TITLEFIELD____icontains=title)
        return queryset

    def list(self, request, *args, **kwargs):
        serializer = __CLASSNAME__Serializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data)
