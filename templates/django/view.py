class __CLASSNAME__ViewSet(viewsets.ModelViewSet):
    queryset = __CLASSNAME__.objects.all()
    serializer_class = __CLASSNAME__Serializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return __CLASSNAME__.objects.all()

    @action(detail=True, methods=['get'])
    @method_decorator(cache_page(60 * 3))
    def custom_list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    # Add error handling for specific methods
    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


