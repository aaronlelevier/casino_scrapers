from django.contrib import admin

from provider import models


@admin.register(models.Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ('name',)
