from .javascript import JavascriptMixin


class ModelPage(JavascriptMixin):
    """Inherit from ``JavascriptMixin`` so has access 
    to the ``$.active xhr wait method``."""

    def __init__(self, driver, new_link, list_name, list_data, *args, **kwargs):
        # Selenium
        self.driver = driver
        # Page
        self.new_link = new_link
        self.list_name = list_name
        self.list_data = list_data

    def find_new_link(self):
        return self.wait_for_xhr_request(self.new_link)

    def find_wait_and_assert_elem(self, elem, value):
        elem_input = self.wait_for_xhr_request(elem)
        assert elem_input.get_attribute("value") == value

    def find_and_assert_elems(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k + "_input", self.driver.find_element_by_id(k))
            assert getattr(self, k + "_input").get_attribute("value") == v

    def find_list_name(self):
        return self.wait_for_xhr_request(self.list_name, plural=True)

    def find_list_data(self, just_refreshed=False):
        return self.wait_for_xhr_request(self.list_data, plural=True, just_refreshed=just_refreshed)

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
