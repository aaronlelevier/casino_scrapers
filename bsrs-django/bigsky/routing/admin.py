from django.contrib import admin

from routing import models


@admin.register(models.Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    pass


@admin.register(models.ProfileFilter)
class ProfileFilterAdmin(admin.ModelAdmin):
    pass


@admin.register(models.AvailableFilter)
class AvailableFilterAdmin(admin.ModelAdmin):
    pass
