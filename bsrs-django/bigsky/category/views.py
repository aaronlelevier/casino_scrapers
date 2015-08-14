from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from category.models import CategoryType, Category
from category import serializers as cs


class CategoryTypeViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    queryset = CategoryType.objects.all()

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'list':
            return cs.CategoryTypeListSerializer
        elif self.action == 'retrieve':
            return cs.CategoryTypeDetailSerializer
        else:
            return cs.CategoryTypeSerializer


class CategoryViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    queryset = Category.objects.all()

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'list':
            return cs.CategoryListSerializer
        else:
            return cs.CategorySerializer