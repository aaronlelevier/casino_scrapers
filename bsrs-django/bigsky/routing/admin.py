from django.contrib import admin

from routing import models


@admin.register(models.Assignment)
class PersonAdmin(admin.ModelAdmin):
    pass
