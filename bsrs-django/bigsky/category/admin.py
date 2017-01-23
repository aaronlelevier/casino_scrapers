from django.contrib import admin

from category import models


@admin.register(models.CategoryStatus)
class CatgegoryStatusAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'level', 'label', 'subcategory_label', 'created',)


@admin.register(models.ScCategory)
class ScCategoryAdmin(admin.ModelAdmin):
    list_display = ('key', 'sc_name',)
