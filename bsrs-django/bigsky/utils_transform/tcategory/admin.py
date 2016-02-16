from django.contrib import admin

from utils_transform.tcategory import models


BASE_LIST_DISPLAY = ('name', 'description',)


@admin.register(models.CategoryType)
class LocationRegionAdmin(admin.ModelAdmin):
    list_display = search_fields = BASE_LIST_DISPLAY


@admin.register(models.CategoryTrade)
class LocationRegionAdmin(admin.ModelAdmin):
    list_display = search_fields = BASE_LIST_DISPLAY


@admin.register(models.CategoryIssue)
class LocationRegionAdmin(admin.ModelAdmin):
    list_display = search_fields = BASE_LIST_DISPLAY
