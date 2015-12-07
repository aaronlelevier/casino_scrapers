# import os

# from django.contrib.contenttypes.models import ContentType
# from django.db.models.loading import get_model


# def db_record_counts():
#     for ct in ContentType.objects.all():
#         try:
#             model = get_model(ct.app_label, ct.model)
#             print("{}.{}: {}".format(ct.app_label, ct.model, model.objects.count()))
#         except (KeyError, LookupError):
#             pass


class ListObject(object):
    
    def __init__(self, x):
        self.x = x
    
    def __getitem__(self, item):
        return self.x[item]
    
    def __iter__(self):        
        return iter(self.x)
    
    def __len__(self):
        return len(self.x)
    
    def count(self):
        return len(self.x)


# ### For use w/ Django 1.9 (not fully function b/c Apps not registering correctly)

# from django.core.exceptions import AppRegistryNotReady
# from django.apps import AppConfig

# PATH = os.path.join(os.environ['VIRTUAL_ENV'],
#                     "lib/python3.4/site-packages/django/contrib/admin")


# class AppConfigWithPath(AppConfig):

#     def __init__(self, path, *args, **kwargs):
#         self.path = path
#         super(AppConfigWithPath, self).__init__(*args, **kwargs)

# def print_db_record_counts():
#     for ct in ContentType.objects.all():
#         try:
#             app_config = AppConfigWithPath(
#                 path=PATH,
#                 app_name=ct.app_label,
#                 app_module=ct.model,
#             )
#             model = app_config.get_model(ct.model)
#             print("{}.{}: {}".format(ct.app_label,
#                                      ct.model, model.objects.count()))
#         except (KeyError, LookupError, AppRegistryNotReady):
#             pass