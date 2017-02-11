from rest_framework import serializers

from category.models import Category, ScCategory
from category.validators import (CategoryParentAndNameValidator,
                                 RootCategoryRequiredFieldValidator)
from tenant.mixins import RemoveTenantMixin
from utils.serializers import BaseCreateSerializer


class ScCategorySerializer(serializers.ModelSerializer):

    name = serializers.CharField(source='sc_name')

    class Meta:
        model = ScCategory
        fields = ('id', 'name')


### CATEGORY

CATEGORY_FIELDS = ('id', 'name', 'description', 'label',
    'cost_amount', 'cost_currency', 'cost_code',)


# Leaf Node

class CategoryIDNameOnlySerializer(BaseCreateSerializer):
    """For use with the person-current endpoint"""

    class Meta:
        model = Category
        fields = ('id', 'name',)


class CategoryIDNameSerializer(BaseCreateSerializer):

    verbose_name = serializers.CharField(source='parents_and_self_as_string')

    class Meta:
        model = Category
        fields = ('id', 'name', 'verbose_name', 'level',)


class CategoryChildrenSerializer(BaseCreateSerializer):

    verbose_name = serializers.CharField(source='parents_and_self_as_string')
    children = CategoryIDNameSerializer(many=True, read_only=True)
    parent_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='parent')
    inherited = serializers.DictField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'verbose_name', 'level', 'parent_id', 'children', 'label',
                  'subcategory_label', 'cost_amount', 'inherited', 'cost_currency')


class CategoryRoleSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name',)


# Main

class CategoryListSerializer(BaseCreateSerializer):

    verbose_name = serializers.CharField(source='parents_and_self_as_string')

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('level', 'verbose_name')


class CategoryDetailSerializer(BaseCreateSerializer):

    parent = CategoryIDNameSerializer(read_only=True)
    children = CategoryIDNameSerializer(many=True, read_only=True)
    inherited = serializers.DictField()
    sc_category = ScCategorySerializer()

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('level', 'subcategory_label', 'parent',
                                    'children', 'inherited', 'sc_category')

    @staticmethod
    def eager_load(queryset):
        return (queryset.select_related('parent')
                        .prefetch_related('children__children'))


class CategoryUpdateSerializer(BaseCreateSerializer):

    children = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(),
                                                  many=True, required=False)

    class Meta:
        model = Category
        validators = [CategoryParentAndNameValidator(),
                      RootCategoryRequiredFieldValidator('cost_amount'),
                      RootCategoryRequiredFieldValidator('sc_category'),
                      RootCategoryRequiredFieldValidator('cost_code')]
        fields = CATEGORY_FIELDS + ('subcategory_label', 'parent', 'children', 'sc_category')


class CategoryCreateSerializer(RemoveTenantMixin, BaseCreateSerializer):

    children = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(),
                                                  many=True, required=False)

    class Meta:
        model = Category
        validators = [CategoryParentAndNameValidator(),
                      RootCategoryRequiredFieldValidator('cost_amount'),
                      RootCategoryRequiredFieldValidator('sc_category'),
                      RootCategoryRequiredFieldValidator('cost_code')]
        fields = CATEGORY_FIELDS + ('tenant', 'subcategory_label', 'parent',
                                    'children', 'sc_category')
