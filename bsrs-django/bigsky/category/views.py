from rest_framework.decorators import list_route
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from category import serializers as cs
from category.models import Category
from utils.mixins import EagerLoadQuerySetMixin
from utils.views import BaseModelViewSet


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

    3. Get all categories for power select input
        `/api/admin/categories/?name__icontains={x}&page_size=25`
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
        if 'parent' in self.request.query_params:
            return cs.CategoryIDNameSerializerTicket
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
        categories = Category.objects.filter(parent__isnull=True)
        page = self.paginate_queryset(categories)
        serializer = cs.CategoryIDNameSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)
