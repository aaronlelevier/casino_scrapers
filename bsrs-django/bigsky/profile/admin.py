from django.contrib import admin

from profile import models


@admin.register(models.Assignment)
class PersonAdmin(admin.ModelAdmin):
    pass
