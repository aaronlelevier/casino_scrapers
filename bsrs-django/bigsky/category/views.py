from django.conf import settings

from rest_framework.decorators import list_route
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from category import serializers as cs
from category.models import Category
from utils.mixins import EagerLoadQuerySetMixin, SearchMultiMixin, FilterByTenantMixin
from utils.permissions import CrudPermissions
from utils.views import BaseModelViewSet, paginate_queryset_as_response


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

    2. General power-select endpoint

        `/api/admin/categories/category__icontains=<search_key>/`

    3. AutomationFilter power-select endpoint

        `/api/admin/categories/automation-criteria/<search_key>/`

    '''
    model = Category
    permission_classes = (IsAuthenticated, CrudPermissions)
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

    @list_route(methods=['GET'])
    @paginate_queryset_as_response(cs.CategoryChildrenSerializer)
    def parents(self, request):
        """
        For ticket top level category open power select and role ccategory power select
        """
        return Category.objects.filter(parent__isnull=True)

    @list_route(methods=['GET'], url_path=r"category__icontains=(?P<search_key>[\w\-]+)")
    @paginate_queryset_as_response(cs.CategorySearchSerializer)
    def search(self, request, search_key=None):
        return Category.objects.search_power_select(search_key)

    @list_route(methods=['GET'], url_path=r"automation-criteria/(?P<search_key>[\w\-]+)")
    @paginate_queryset_as_response(cs.CategoryAutomationFilterSerializer)
    def automation_filter(self, request, search_key=None):
        return Category.objects.ordered_parents_and_self_as_strings(search_key)
