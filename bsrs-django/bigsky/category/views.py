from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from category.models import Category
from category import serializers as cs


class CategoryViewSet(viewsets.ModelViewSet):

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
        else:
            return cs.CategorySerializer