from django.contrib import admin

from util import models


@admin.register(models.MainSetting)
class MainSettingAdmin(admin.ModelAdmin):
    pass


@admin.register(models.CustomSetting)
class CustomSettingAdmin(admin.ModelAdmin):
    pass