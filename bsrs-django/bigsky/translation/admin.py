from django.contrib import admin

from translation import models


@admin.register(models.Locale)
class LocaleAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Definition)
class DefinitionAdmin(admin.ModelAdmin):
    pass
