from django.contrib import admin

from utils_transform.tlocation import models


@admin.register(models.LocationDistrict)
class LocationDistrictAdmin(admin.ModelAdmin):
    pass


@admin.register(models.LocationRegion)
class LocationRegionAdmin(admin.ModelAdmin):
    pass


@admin.register(models.LocationStore)
class LocationStoreAdmin(admin.ModelAdmin):
    pass
