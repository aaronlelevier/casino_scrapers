from django.contrib import admin

from tenant import models


@admin.register(models.Tenant)
class TenantAdmin(admin.ModelAdmin):
    pass
