from django.contrib import admin

from third_party import models


@admin.register(models.ThirdParty)
class ThirdPartyAdmin(admin.ModelAdmin):
    pass


@admin.register(models.ThirdPartyStatus)
class ThirdPartyStatusAdmin(admin.ModelAdmin):
    pass
