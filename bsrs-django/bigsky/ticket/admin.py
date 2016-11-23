from django.contrib import admin

from ticket import models


@admin.register(models.TicketStatus)
class TicketStatusAdmin(admin.ModelAdmin):
    pass


@admin.register(models.TicketPriority)
class TicketPriorityAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Ticket)
class TicketAdmin(admin.ModelAdmin):

    list_display = ('id', 'number', 'location', 'category_names',)

    def category_names(self, obj):
        return "\n".join([x for x in obj.categories.values_list('name', flat=True)])


@admin.register(models.TicketActivityType)
class TicketActivityTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(models.TicketActivity)
class TicketActivityAdmin(admin.ModelAdmin):
    list_display = ('created', 'type_name','person', 'content',)

    def type_name(self, obj):
        return obj.type.name
