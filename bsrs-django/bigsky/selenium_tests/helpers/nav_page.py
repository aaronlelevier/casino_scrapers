from .javascript import JavascriptMixin


class NavPage(JavascriptMixin):

    def __init__(self, driver):
        self.driver = driver

    def click_admin(self):
        self.wait_for_xhr_request("t-nav-admin").click()
    
    def find_people_link(self):
        return self.wait_for_xhr_request("t-nav-admin-people")
    
    def find_location_link(self):
        return self.wait_for_xhr_request("t-nav-admin-location")
    
    def find_location_level_link(self):
        return self.wait_for_xhr_request("t-nav-admin-location-level")
    
    def find_role_link(self):
        return self.wait_for_xhr_request("t-nav-admin-role")

    def find_ticket_link(self):
        return self.wait_for_xhr_request("t-nav-tickets")

    def find_assignment_profiles_link(self):
        return self.wait_for_xhr_request("t-nav-admin-assignment-profiles")
