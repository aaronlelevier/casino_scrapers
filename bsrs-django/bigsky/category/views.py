from django.conf import settings

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

    ### Sub API Endpoints
    1. Get top level Categories

        `/api/admin/categories/parents/`

    2. General power-select endpoint

        `/api/admin/categories/category__icontains=<search_key>/`

    3. ProfileFilter power-select endpoint

        `/api/admin/categories/profile-filter/<search_key>/`

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
        elif self.action in ('update', 'partial_update'):
            return cs.CategoryUpdateSerializer
        elif self.action == 'create':
            return cs.CategoryCreateSerializer

    def create(self, request, *args, **kwargs):
        request.data['tenant'] = request.user.role.tenant.id
        return super(CategoryViewSet, self).create(request, *args, **kwargs)

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

    @list_route(methods=['GET'], url_path=r"category__icontains=(?P<search_key>[\w\-]+)")
    def search(self, request, search_key=None):
        queryset = Category.objects.search_power_select(search_key)
        queryset = self.paginate_queryset(queryset)
        serializer = cs.CategorySearchSerializer(queryset, many=True)
        return self.get_paginated_response(serializer.data)

    @list_route(methods=['GET'], url_path=r"assignment-criteria/(?P<search_key>[\w\-]+)")
    def profile_filter(self, request, search_key=None):
        queryset = Category.objects.filter(name__icontains=search_key)
        queryset = self.paginate_queryset(queryset)
        serializer = cs.CategoryProfileFilterSerializer(queryset, many=True)
        return self.get_paginated_response(serializer.data)
