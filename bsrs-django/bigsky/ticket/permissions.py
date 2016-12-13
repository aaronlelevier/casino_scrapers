from rest_framework import permissions


class TicketActivityPermissions(permissions.BasePermission):

    def has_permission(self, request, view):
        return 'view_ticket' in request.user.permissions
