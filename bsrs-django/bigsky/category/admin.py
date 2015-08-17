from django.contrib import admin

from category import models


@admin.register(models.Category)
class CatgegoryAdmin(admin.ModelAdmin):
    pass
