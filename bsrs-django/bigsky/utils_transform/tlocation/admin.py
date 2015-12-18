from django.contrib import admin

from utils_transform.tlocation import models


BASE_LIST_DISPLAY = ('name', 'number',)


@admin.register(models.LocationRegion)
class LocationRegionAdmin(admin.ModelAdmin):
    list_display = search_fields = BASE_LIST_DISPLAY


@admin.register(models.LocationDistrict)
class LocationDistrictAdmin(admin.ModelAdmin):
    list_display = search_fields = BASE_LIST_DISPLAY + ('regionnumber',)


@admin.register(models.LocationStore)
class LocationStoreAdmin(admin.ModelAdmin):
    list_display = search_fields = BASE_LIST_DISPLAY + ('distnumber',)
