from rest_framework.permissions import IsAuthenticated

from category.models import Category
from category import serializers as cs
from utils.views import BaseModelViewSet
from rest_framework.decorators import list_route
from rest_framework.response import Response


class CategoryViewSet(BaseModelViewSet):
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
        `/api/admin/categories/?name__icontains={x}`
    '''
    permission_classes = (IsAuthenticated,)
    queryset = Category.objects.all()
    model = Category
    filter_fields = [f.name for f in model._meta.get_fields()]

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
        queryset = Category.objects.filter(parent__isnull=True)
        serializer = cs.CategoryParentSerializer(queryset, many=True)
        return Response(serializer.data)
