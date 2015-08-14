from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from category.models import CategoryType, Category
from category.serializers import (CategoryTypeSerializer, CategoryListSerializer,
    CategorySerializer)


class CategoryTypeViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    serializer_class = CategoryTypeSerializer
    queryset = CategoryType.objects.all()


class CategoryViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    queryset = Category.objects.all()

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'list':
            return CategoryListSerializer
        else:
            return CategorySerializer