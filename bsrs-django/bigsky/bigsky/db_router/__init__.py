TRANSFORM_APPS = ('tcategory', 'tlocation', 'trole', 'tperson')


class TransformRouter(object):
    """
    A router to control all database operations on models in the
    "utils_transform" application.
    """
    def db_for_read(self, model, **hints):
        """
        Attempts to read 'transforms' models go to 'transforms' database.
        """
        if model._meta.app_label in TRANSFORM_APPS:
            return 'transforms'
        return None

    def db_for_write(self, model, **hints):
        """
        Attempts to write 'transforms' models go to 'transforms' database.
        """
        if model._meta.app_label in TRANSFORM_APPS:
            return 'transforms'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if a model in the 'tlocation' app is involved.
        """
        if obj1._meta.app_label in TRANSFORM_APPS or \
           obj2._meta.app_label in TRANSFORM_APPS:
            return True
        return None

    def allow_migrate(self, db, app_label, model=None, **hints):
        """
        Make sure the 'tlocation' app only appears in the 'transforms'
        database.
        """
        if app_label in TRANSFORM_APPS:
            return db == 'transforms'
        return None


class DefaultRouter(object):
    """
    Catch-all Router for all other DB transactions that aren't in the 
    ``utils_transform`` app.
    """

    def db_for_read(self, model, **hints):
        return 'default'

    def db_for_write(self, model, **hints):
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        if obj1._state.db == obj2._state.db:
            return True
        return None

    def allow_migrate(self, db, app_label, model=None, **hints):
        return True
