class __CLASSNAME__ViewSet(CustomLimitOffsetPagination):
    queryset = __CLASSNAME__.objects.all().order_by('id')
    serializer_class = __CLASSNAME__Serializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    __FILTERING__
    __PERMISSIONS__
