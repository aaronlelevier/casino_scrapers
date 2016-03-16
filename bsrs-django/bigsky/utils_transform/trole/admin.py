from django.contrib import admin

from utils_transform.trole import models


BASE_LIST_DISPLAY = ('name', 'description',)


@admin.register(models.DominoRole)
class LocationRegionAdmin(admin.ModelAdmin):
    list_display = search_fields = BASE_LIST_DISPLAY
