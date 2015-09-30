from django.contrib import admin

from generic import models


@admin.register(models.SavedSearch)
class SavedSearchAdmin(admin.ModelAdmin):
    pass


@admin.register(models.MainSetting)
class MainSettingAdmin(admin.ModelAdmin):
    pass


@admin.register(models.CustomSetting)
class CustomSettingAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    pass
