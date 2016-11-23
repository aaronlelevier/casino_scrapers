from django.contrib import admin

from automation import models


@admin.register(models.AutomationEvent)
class AutomationEventAdmin(admin.ModelAdmin):
    list_display = ('key',)


@admin.register(models.AutomationActionType)
class AutomationActionTypeAdmin(admin.ModelAdmin):
    list_display = ('key',)


@admin.register(models.AutomationAction)
class AutomationActionAdmin(admin.ModelAdmin):
    list_display = ('content',)


@admin.register(models.Automation)
class AutomationAdmin(admin.ModelAdmin):
    list_display = ('id', 'description')


@admin.register(models.AutomationFilterType)
class AutomationFilterTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(models.AutomationFilter)
class AutomationFilterAdmin(admin.ModelAdmin):
    list_display = ('id', 'source_key')

    def source_key(self, obj):
        return obj.source.key or obj.source
