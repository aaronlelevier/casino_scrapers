import re
from url_helper import URLHelper

class MethodHelpers(object):

    def at(self, current_url, target_url_regex):
        assert re.match(target_url_regex, current_url)

    def wait_xhr(self, class_name, plural=False):
        return self.wait_for_xhr_request(class_name, plural)

    def find_class_element(self, class_name): 
        return self.driver.find_element_by_class_name(class_name)

    def find_class_elements(self, class_name): 
        return self.driver.find_elements_by_class_name(class_name)

    def find_id_element(self, id_elem): 
        return self.driver.find_element_by_id(id_elem)
