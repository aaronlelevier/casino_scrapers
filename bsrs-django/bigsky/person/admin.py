from django.contrib import admin

from person import models


@admin.register(models.Person)
class PersonAdmin(admin.ModelAdmin):
    pass


@admin.register(models.PersonStatus)
class PersonStatusAdmin(admin.ModelAdmin):
    pass
