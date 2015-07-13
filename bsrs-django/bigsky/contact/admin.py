from django.contrib import admin

from contact import models


@admin.register(models.PhoneNumberType)
class PhoneNumberAdmin(admin.ModelAdmin):
    pass


@admin.register(models.PersonPhoneNumber)
class PersonPhoneNumberAdmin(admin.ModelAdmin):
    pass


@admin.register(models.LocationPhoneNumber)
class LocationPhoneNumberAdmin(admin.ModelAdmin):
    pass


@admin.register(models.AddressType)
class AddressTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(models.PersonAddress)
class PersonAddressAdmin(admin.ModelAdmin):
    pass


@admin.register(models.LocationAddress)
class LocationAddressAdmin(admin.ModelAdmin):
    pass


@admin.register(models.EmailType)
class EmailTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(models.PersonEmail)
class PersonEmailAdmin(admin.ModelAdmin):
    pass


@admin.register(models.LocationEmail)
class LocationEmailAdmin(admin.ModelAdmin):
    pass