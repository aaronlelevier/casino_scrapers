from rest_framework import serializers

from category.models import Category
from utils.serializers import BaseCreateSerializer


### CATEGORY

CATEGORY_FIELDS = ('id', 'name', 'description', 'label',
    'cost_amount', 'cost_currency', 'cost_code', 'has_children')


class CategoryIDNameSerializer(BaseCreateSerializer):
    '''
    Leaf Node Serializer, no public API Endpoint
    '''

    class Meta:
        model = Category
        fields = ('id', 'name', 'parent', 'children', 'has_children')

    def to_representation(self, obj):
        data = super(CategoryIDNameSerializer, self).to_representation(obj)
        data['children_fks'] = data.pop('children', [])
        return data


class CategoryRoleSerializer(BaseCreateSerializer):
    '''
    Serializer for Role detail
    '''
    class Meta:
        model = Category
        fields = ('id', 'name', 'status', 'parent', 'has_children')


class CategoryListSerializer(BaseCreateSerializer):

    parent = CategoryIDNameSerializer(read_only=True)
    children = CategoryIDNameSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('parent', 'children', )


class CategoryDetailSerializer(BaseCreateSerializer):

    parent = CategoryIDNameSerializer(read_only=True)
    children = CategoryIDNameSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('subcategory_label', 'parent', 'children',)


class CategorySerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('subcategory_label', 'parent', 'children',)
