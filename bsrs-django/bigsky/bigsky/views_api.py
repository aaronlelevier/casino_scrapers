from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions


class DashboardView(APIView):

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        d = {}
        
        settings = request.user.role.nonverbose_combined_settings()

        fields = ['dashboard_text']
        for f in fields:
            d[f] = settings[f]

        return Response({'settings': d})
