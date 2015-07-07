from django.contrib import admin

from contact import models


@admin.register(models.PhoneNumberType)
class PhoneNumberAdmin(admin.ModelAdmin):
    pass


@admin.register(models.PhoneNumber)
class PhoneNumberAdmin(admin.ModelAdmin):
    pass


@admin.register(models.AddressType)
class AddressTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Address)
class AddressAdmin(admin.ModelAdmin):
    pass


@admin.register(models.EmailType)
class EmailTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Email)
class EmailAdmin(admin.ModelAdmin):
    pass