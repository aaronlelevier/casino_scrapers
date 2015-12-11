from django.contrib import admin

from utils_transform.tlocation import models


@admin.register(models.LocationDistrict)
class LocationDistrictAdmin(admin.ModelAdmin):
    fields = LocationDistrict._meta.get_fields()


@admin.register(models.LocationRegion)
class LocationRegionAdmin(admin.ModelAdmin):
    fields = LocationRegion._meta.get_fields()


@admin.register(models.LocationStore)
class LocationStoreAdmin(admin.ModelAdmin):
    fields = LocationStore._meta.get_fields()
