from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
import rest_framework_filters as filters

from category.models import Category
from category import serializers as cs


class CategoryFilterSet(filters.FilterSet):
    parent = filters.AllLookupsFilter(name='parent')
    name = filters.AllLookupsFilter(name='name')

    class Meta:
        model = Category
        fields = ['parent', 'name']


class CategoryViewSet(viewsets.ModelViewSet):
    '''
    ### Create
    Can add a single Parent and multiple Children Categories.

    ### Update
    Can add and/or remove a single Parent and multiple Children Categories.

    Must send the Parent/Children on every Update.

    ### Filters
    1. Get top level Categories

        `/api/admin/categories/?parent__isnull=True`

    2. Get Children for a specified Parent

        `/api/admin/categories/?parent=id`

    3. Get all categories for selectize input
        `/api/admin/categories/?name__icontains={x}`
    '''
    permission_classes = (IsAuthenticated,)
    queryset = Category.objects.all()
    filter_class = CategoryFilterSet

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
