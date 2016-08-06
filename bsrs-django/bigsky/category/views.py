from rest_framework.decorators import list_route
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from category import serializers as cs
from category.models import Category
from utils.mixins import EagerLoadQuerySetMixin, SearchMultiMixin
from utils.views import BaseModelViewSet


class CategoryViewSet(EagerLoadQuerySetMixin, SearchMultiMixin, BaseModelViewSet):
    '''
    ### Create
    Can add a single Parent and multiple Children Categories.

    ### Update
    Can add and/or remove a single Parent and multiple Children Categories.

    Must send the Parent/Children on every Update.

    ### Filters
    1. Get top level Categories

        `/api/admin/categories/parents`

    2. Get Children for a specified Parent

        `/api/admin/categories/?parent=id`

    '''
    model = Category
    permission_classes = (IsAuthenticated,)
    queryset = Category.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]
    eager_load_actions = ['retrieve']

    def get_serializer_class(self):
        """
        set the serializer based on the method
        if parent is for category power select in ticket view
        """
        if 'parent' in self.request.query_params:
            return cs.CategoryIDNameSerializer
        elif self.action == 'list':
            return cs.CategoryListSerializer
        elif self.action == 'retrieve':
            return cs.CategoryDetailSerializer
        else:
            return cs.CategorySerializer

    def update(self, request, *args, **kwargs):
        """
        Need to explicity call `save()` on each child, so the `level` attr, which
        counts the number of parents that the child has, is updated.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        # custom: start
        for child_id in serializer.data['children']:
            child = self.model.objects.get(id=child_id)
            child.save()
        # custom: end
        return Response(serializer.data)

    @list_route(methods=['GET'])
    def parents(self, request):
        # for ticket top level category open power select
        categories = Category.objects.filter(parent__isnull=True)
        page = self.paginate_queryset(categories)
        serializer = cs.CategoryIDNameSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    # @list_route(methods=['GET'], url_path=r"parent=(?P<search_id>[\w\-]+)")
    # def parent(self, request, search_id=None):
    #     # for ticket category open power select (not top level).  Will tackle later today
    #     categories = Category.objects.filter(parent__id__in=[search_id])
    #     serializer = cs.CategorySearchSerializer(categories, many=True)
    #     return Response(serializer.data)

    @list_route(methods=['GET'], url_path=r"category__icontains=(?P<search_key>[\w\-]+)")
    def search(self, request, search_key=None):
        queryset = Category.objects.search_power_select(search_key)
        self.paginate_queryset(queryset)
        serializer = cs.CategorySearchSerializer(queryset, many=True)
        return self.get_paginated_response(serializer.data)
