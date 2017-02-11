from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import list_route
from rest_framework.response import Response

from category import serializers as cs
from category.models import Category, ScCategory
from utils.mixins import (EagerLoadQuerySetMixin, FilterByTenantMixin,
                          FilterRelatedMixin, SearchMultiMixin)
from utils.permissions import CrudPermissions
from utils.views import BaseModelViewSet, paginate_queryset_as_response


class ScCategoryViewSet(FilterRelatedMixin, mixins.ListModelMixin, viewsets.GenericViewSet):

    model = ScCategory
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = cs.ScCategorySerializer
    queryset = ScCategory.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]


class CategoryViewSet(FilterByTenantMixin, EagerLoadQuerySetMixin,
                      SearchMultiMixin, BaseModelViewSet):
    '''
    ### Create
    Can add a single Parent and multiple Children Categories.

    ### Update
    Can add and/or remove a single Parent and multiple Children Categories.

    Must send the Parent/Children on every Update.

    ### Sub API Endpoints
    1. Get top level Categories

        `/api/admin/categories/parents/`
    '''
    model = Category
    permission_classes = (permissions.IsAuthenticated, CrudPermissions)
    queryset = Category.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]
    eager_load_actions = ['retrieve']

    def get_serializer_class(self):
        """
        set the serializer based on the method
        if parent is for category power select in ticket view
        """
        if 'parent' in self.request.query_params:
            return cs.CategoryChildrenSerializer
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

    @paginate_queryset_as_response()
    def list(self, request, *args, **kwargs):
        if 'ordering' not in request.query_params:
            return sorted(self.get_queryset(), key=lambda x: x.parents_and_self_as_string())
        return self.get_queryset()

    @list_route(methods=['GET'])
    @paginate_queryset_as_response(cs.CategoryChildrenSerializer)
    def parents(self, request):
        """
        For ticket top level category open power select and role ccategory power select
        """
        return Category.objects.filter(parent__isnull=True)
