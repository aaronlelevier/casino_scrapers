from django.contrib import admin

from . import models


@admin.register(models.Location)
class LocationAdmin(admin.ModelAdmin):
    pass
