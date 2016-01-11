from django.contrib import admin

from utils import models


@admin.register(models.Tester)
class TesterAdmin(admin.ModelAdmin):
    pass


@admin.register(models.MainSetting)
class MainSettingAdmin(admin.ModelAdmin):
    pass


@admin.register(models.CustomSetting)
class CustomSettingAdmin(admin.ModelAdmin):
    pass