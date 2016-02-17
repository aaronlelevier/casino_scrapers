from django.contrib import admin

from category import models


@admin.register(models.CategoryStatus)
class CatgegoryStatusAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Category)
class CatgegoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'level', 'label', 'subcategory_label', 'created',)
