from rest_framework import serializers

from category.models import Category
from category.validators import CategoryParentAndNameValidator
from tenant.mixins import RemoveTenantMixin
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
    # DTD and Person Current
    class Meta:
        model = Category
        fields = ('id', 'name',)


class CategoryIDNameSerializer(BaseCreateSerializer):

    children = CategoryChildrenSerializer(many=True, read_only=True)
    parent_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='parent')

    class Meta:
        model = Category
        fields = ('id', 'name', 'level', 'parent_id', 'children', 'label', 'subcategory_label')


class CategoryRoleSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name',)


# Main

class CategoryListSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('level',)


class CategorySearchSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name', 'cost_code')


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


class CategoryUpdateSerializer(BaseCreateSerializer):

    children = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(),
                                                  many=True, required=False)

    class Meta:
        model = Category
        validators = [CategoryParentAndNameValidator()]
        fields = CATEGORY_FIELDS + ('subcategory_label', 'parent', 'children',)


class CategoryCreateSerializer(RemoveTenantMixin, BaseCreateSerializer):

    children = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(),
                                                  many=True, required=False)

    class Meta:
        model = Category
        validators = [CategoryParentAndNameValidator()]
        fields = CATEGORY_FIELDS + ('tenant', 'subcategory_label', 'parent', 'children',)
