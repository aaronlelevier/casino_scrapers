class SettingMixin(object):

    def nonverbose_combined_settings(self):
        """
        Key:Value only. No inheritance information.

        Must be mixed in to Models with a ForeignKey to the Setting Model
        because on each model is where ``combined_settings`` method is defined,
        and this method may return inherited Model Fields.

        :return: dict where:
          key = <settings name> i.e. 'dashboard_text'
          value = settings final value whether inherited or not. i.e. 'Welcome'
        """
        d = {}
        for k,v in self.combined_settings().items():
            print(k, v)
            if 'value' in v and v is not None:
                d[k] = v['value']
            else:
                d[k] = v['inherited_value']
        return d
