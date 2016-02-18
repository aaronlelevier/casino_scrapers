from rest_framework import serializers

from category.models import Category
from category.validators import CategoryParentAndNameValidator
from utils.serializers import BaseCreateSerializer


### CATEGORY

CATEGORY_FIELDS = ('id', 'name', 'description', 'label',
    'cost_amount', 'cost_currency', 'cost_code',)


# Leaf Node

class CategoryIDNameOnlySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name',)


class CategoryIDNameSerializerTicket(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name', 'level', 'children', 'parent', 'label', 'subcategory_label')

    def to_representation(self, obj):
        data = super(CategoryIDNameSerializerTicket, self).to_representation(obj)
        data['children_fks'] = data.pop('children', [])
        data['parent_id'] = data.pop('parent', [])
        return data


#TODO: check if can use above serializer
class CategoryIDNameSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name', 'parent', 'children', 'level',)

    def to_representation(self, obj):
        data = super(CategoryIDNameSerializer, self).to_representation(obj)
        data['children_fks'] = data.pop('children', [])
        return data


class CategoryRoleSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name', 'status', 'parent',)


class CategoryParentSerializer(BaseCreateSerializer):

    # parent = CategoryIDNameSerializer(read_only=True)
    # children = CategoryIDNameSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS


# Main

class CategoryListSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('level',)


class CategoryDetailSerializer(BaseCreateSerializer):

    parent = CategoryIDNameSerializer(read_only=True)
    children = CategoryIDNameSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('level', 'subcategory_label', 'parent', 'children',)

    @staticmethod
    def eager_load(queryset):
        return (queryset.select_related('parent')
                        .prefetch_related('children__children'))


class CategorySerializer(BaseCreateSerializer):

    children = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True, required=False)

    class Meta:
        model = Category
        validators = [CategoryParentAndNameValidator()]
        fields = CATEGORY_FIELDS + ('subcategory_label', 'parent', 'children',)
