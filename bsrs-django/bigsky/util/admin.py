from django.contrib import admin

from util import models


@admin.register(models.Setting)
class SettingAdmin(admin.ModelAdmin):
    pass