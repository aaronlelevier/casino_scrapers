from selenium import webdriver
from javascript import JavascriptMixin

class BasePage(JavascriptMixin):
    def __init__(self, driver, wait):
        self.driver = driver
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)

