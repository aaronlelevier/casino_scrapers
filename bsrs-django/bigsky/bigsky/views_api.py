from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions


class DashboardView(APIView):

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        d = {}
        
        inherited_fields = self._inherited_fields(request.user.role.inherited())

        fields = ['dashboard_text']
        for f in fields:
            d[f] = inherited_fields[f]

        return Response({'settings': d})

    @staticmethod
    def _inherited_fields(inherited):
        """
        Key:Value only. No inheritance information.

        :return: dict where:
          key = <settings name> i.e. 'dashboard_text'
          value = settings final value whether inherited or not. i.e. 'Welcome'
        """
        d = {}
        for k,v in inherited.items():
            if 'value' in v and v['value'] is not None:
                d[k] = v['value']
            else:
                d[k] = v['inherited_value']

        return d
