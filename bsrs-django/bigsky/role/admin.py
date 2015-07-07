from django.contrib import admin

from role import models


@admin.register(models.Role)
class RoleAdmin(admin.ModelAdmin):
    pass
