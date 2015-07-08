from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.generic.base import TemplateView


class IndexView(TemplateView):
    '''
    Only Authenticated Users can get to the Home page 
    where the Ember Authenticated App lives.  Else, they
    get redirected to the Login Page.
    '''
    template_name = 'index.html'

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated():
            return HttpResponseRedirect(reverse('login'))
        else:
            return super(IndexView, self).dispatch(request, *args, **kwargs)