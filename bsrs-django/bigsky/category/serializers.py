from rest_framework import serializers

from category.models import Category
from category.validators import CategoryParentAndNameValidator
from utils.serializers import BaseCreateSerializer


### CATEGORY

CATEGORY_FIELDS = ('id', 'name', 'description', 'label',
    'cost_amount', 'cost_currency', 'cost_code',)


# Leaf Node

class CategoryChildrenSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name', 'level',)


class CategoryIDNameOnlySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name',)


class SetParentIdMixin(object):

    def to_representation(self, obj):
        data = super(SetParentIdMixin, self).to_representation(obj)
        data['parent_id'] = data.pop('parent', [])
        return data


class CategoryIDNameSerializer(BaseCreateSerializer):

    children = CategoryChildrenSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'level', 'parent', 'children', 'label', 'subcategory_label')


class CategoryIDNameSerializerTicket(SetParentIdMixin, CategoryIDNameSerializer):
    pass


class CategoryRoleSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name', 'status', 'parent',)


class CategoryParentSerializer(BaseCreateSerializer):

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
    children = CategoryChildrenSerializer(many=True, read_only=True)

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
