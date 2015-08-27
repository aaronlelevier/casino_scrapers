from method_helpers import MethodHelpers
from base_page import BasePage


class RolePage(BasePage, MethodHelpers):
    '''
    Role page containing all DOM nodes
    '''
    def click_btn(self):
       element = self.find_id_element()

    def find_new_link(self):
        return self.wait_xhr("t-role-new")

    def find_wait_and_assert_elem(self, elem, value):
        elem_input = self.wait_xhr(elem)
        assert elem_input.get_attribute("value") == value

    def find_and_assert_elems(self, **kwargs):
        for k,v in kwargs.iteritems():
            setattr(self, k + "_input", self.find_id_element(k))
            assert getattr(self, k + "_input").get_attribute("value") == v
