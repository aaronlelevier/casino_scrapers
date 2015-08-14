from rest_framework import serializers

from category.models import CategoryType, Category
from util.serializers import BaseCreateSerializer


### CATEGORY TYPE

class CategoryTypeSerializer(BaseCreateSerializer):

    parent = serializers.PrimaryKeyRelatedField(
        queryset=CategoryType.objects.all(),
        allow_null=True
        )
    child = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = CategoryType
        fields = ('id', 'name', 'parent', 'child',)


### CATEGORY

CATEGORY_FIELDS = ('id', 'name', 'description', 'type',
    'cost_amount', 'cost_currency', 'cost_code',)


class CategoryIDNameSerializer(BaseCreateSerializer):
    '''
    Leaf Node Serializer, no public API Endpoint
    '''
    class Meta:
        model = Category
        fields = ('id', 'name',)


class CategoryListSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS


class CategorySerializer(BaseCreateSerializer):

    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True
        )
    subcategories = CategoryIDNameSerializer(many=True, read_only=True, source='children')

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('parent', 'subcategories',)