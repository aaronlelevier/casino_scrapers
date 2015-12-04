from category import serializers as cs
from category.models import Category
from utils.views import BaseModelViewSet

from rest_framework.decorators import list_route
from rest_framework.permissions import IsAuthenticated
from utils.mixins import EagerLoadQuerySetMixin


class CategoryViewSet(EagerLoadQuerySetMixin, BaseModelViewSet):
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

    3. Get all categories for selectize input
        `/api/admin/categories/?name__icontains={x}&page_size=999`
    '''
    model = Category
    permission_classes = (IsAuthenticated,)
    queryset = Category.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]
    eager_load_actions = ['retrieve']

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'list':
            return cs.CategoryListSerializer
        elif self.action == 'retrieve':
            return cs.CategoryDetailSerializer
        else:
            return cs.CategorySerializer

    @list_route(methods=['GET'])
    def parents(self, request):
        categories = Category.objects.filter(parent__isnull=True)
        page = self.paginate_queryset(categories)
        serializer = cs.CategoryParentSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)
