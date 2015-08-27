from method_helpers import MethodHelpers
from base_page import BasePage


class LocationLevelPage(BasePage, MethodHelpers):
    '''
    Location Level page containing all DOM nodes
    '''
    def click_btn(self):
       element = self.find_id_element()

    def find_new_link(self):
        return self.wait_xhr("t-location-level-new")

    def find_wait_and_assert_elem(self, elem, value):
        elem_input = self.wait_xhr(elem)
        assert elem_input.get_attribute("value") == value

    def find_and_assert_elems(self, **kwargs):
        for k,v in kwargs.iteritems():
            setattr(self, k + "_input", self.find_id_element(k))
            assert getattr(self, k + "_input").get_attribute("value") == v

    def find_list_name(self):
        return self.find_class_elements("t-location-level-name")

    def find_list_data(self):
        return self.wait_xhr("t-location-level-data")

    def click_name_in_list(self, name, list_view_elements):
        new_location = None
        for row in list_view_elements:
            if row.text and row.text == name:
                new_location = row
        if new_location:
            try:
                new_location.click()
            except AttributeError as e:
                raise e("new location level not found")
