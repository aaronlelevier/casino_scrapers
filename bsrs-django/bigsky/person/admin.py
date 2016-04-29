from django.contrib import admin

from person import models


@admin.register(models.Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('username', 'first_name', 'middle_initial', 'last_name', 'fullname')


@admin.register(models.PersonStatus)
class PersonStatusAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Role)
class RoleAdmin(admin.ModelAdmin):
    pass
