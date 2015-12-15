from django.contrib import admin

from utils_transform.tlocation import models


@admin.register(models.LocationRegion)
class LocationRegionAdmin(admin.ModelAdmin):
    list_display = ('name', 'number')
    fields = models.LocationRegion._meta.get_fields()


@admin.register(models.LocationDistrict)
class LocationDistrictAdmin(admin.ModelAdmin):
    list_display = ('name', 'number', 'regionnumber')
    fields = models.LocationDistrict._meta.get_fields()


@admin.register(models.LocationStore)
class LocationStoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'number', 'distnumber')
    fields = models.LocationStore._meta.get_fields()
