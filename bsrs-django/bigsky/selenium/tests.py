from selenium import webdriver
from selenium.webdriver.common.keys import Keys

browser = webdriver.Firefox()

browser.get("http://127.0.0.1:8000/login/")
assert 'Login' in browser.title

browser.close()