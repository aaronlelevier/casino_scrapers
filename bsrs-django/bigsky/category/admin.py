from django.contrib import admin

from category import models


@admin.register(models.Category)
class CatgegoryAdmin(admin.ModelAdmin):
    pass


@admin.register(models.CategoryType)
class CatgegoryTypeAdmin(admin.ModelAdmin):
    pass