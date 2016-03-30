from django.contrib import admin

from utils_transform.tperson import models


BASE_LIST_DISPLAY = ('username', 'role',)


@admin.register(models.DominoPerson)
class DominoPersonAdmin(admin.ModelAdmin):
    list_display = search_fields = BASE_LIST_DISPLAY
