from django.contrib import admin

from routing import models


@admin.register(models.Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'description')


@admin.register(models.ProfileFilter)
class ProfileFilterAdmin(admin.ModelAdmin):
    list_display = ('id', 'source_key')

    def source_key(self, obj):
        return obj.source.key or obj.source

@admin.register(models.AvailableFilter)
class AvailableFilterAdmin(admin.ModelAdmin):
    pass
