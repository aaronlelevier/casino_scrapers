class FillInHelper(object):
    '''
    This Helper will loop through model's attributes and find the element on the page
    and fill in input with the attributes' values
    Ensure model has attrs (k) equal to id on template 
    '''
    def _fill_in(self, model, clear=False):
        for k, v in model.__dict__.items():
            setattr(self, k + '_input', self.driver.find_element_by_id(k))
            inputrr = getattr(self, k + '_input')
            if clear == True:
                inputrr.clear()
            inputrr.send_keys(v)


class FillInDictHelper(object):
    '''
    This Helper will loop through model's attributes and find the element on the page
    and fill in input with the attributes' values
    Ensure model has attrs (k) equal to id on template 
    '''
    def _fill_in_dict(self, dict_):
        for k, v in dict_.items():
            setattr(self, k + '_input', self.driver.find_element_by_id(k))
            inputrr = getattr(self, k + '_input')
            inputrr.send_keys(v)
