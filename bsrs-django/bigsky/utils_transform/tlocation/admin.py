from django.contrib import admin

from utils_transform.tlocation import models


@admin.register(models.LocationDistrict)
class LocationDistrictAdmin(admin.ModelAdmin):
    fields = models.LocationDistrict._meta.get_fields()


@admin.register(models.LocationRegion)
class LocationRegionAdmin(admin.ModelAdmin):
    fields = models.LocationRegion._meta.get_fields()


@admin.register(models.LocationStore)
class LocationStoreAdmin(admin.ModelAdmin):
    fields = models.LocationStore._meta.get_fields()
