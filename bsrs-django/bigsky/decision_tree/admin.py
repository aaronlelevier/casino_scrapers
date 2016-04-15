from django.contrib import admin

from decision_tree import models


@admin.register(models.TreeData)
class TreeDataAdmin(admin.ModelAdmin):
    pass


@admin.register(models.TreeField)
class TreeFieldAdmin(admin.ModelAdmin):
    pass


@admin.register(models.TreeOption)
class TreeOptionAdmin(admin.ModelAdmin):
    pass


@admin.register(models.TreeLink)
class TreeLinkAdmin(admin.ModelAdmin):
    pass
