from django.contrib import admin

from utils_transform.trole import models


@admin.register(models.DominoRole)
class DominoRoleAdmin(admin.ModelAdmin):
    list_display = search_fields = ('name', 'selection',)
