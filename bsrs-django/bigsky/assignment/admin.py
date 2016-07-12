from django.contrib import admin

from assignment import models


@admin.register(models.Profile)
class PersonAdmin(admin.ModelAdmin):
    pass
