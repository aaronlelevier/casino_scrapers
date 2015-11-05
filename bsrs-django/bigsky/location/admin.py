from django.contrib import admin

from location import models


@admin.register(models.LocationLevel)
class LocationLevelAdmin(admin.ModelAdmin):
    pass


@admin.register(models.LocationStatus)
class LocationStatusAdmin(admin.ModelAdmin):
    pass


@admin.register(models.LocationType)
class LocationTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Location)
class LocationAdmin(admin.ModelAdmin):
    pass
