from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from category.models import Category
from category import serializers as cs


class CategoryViewSet(viewsets.ModelViewSet):
    '''
    ### Create
    Can add a single Parent and multiple Children Categories.

    ### Update
    Can add and/or remove a single Parent and multiple Children Categories.

    Must send the Parent/Children on every Update.
    '''

    permission_classes = (IsAuthenticated,)
    queryset = Category.objects.all()

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'list':
            return cs.CategoryListSerializer
        elif self.action == 'retrieve':
            return cs.CategoryDetailSerializer
        # elif self.action in ('create', 'update', 'partial_update'):
        #     return cs.CategoryCreateSerializer
        else:
            return cs.CategorySerializer