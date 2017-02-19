# coding: utf-8
#!/usr/bin/python

'''
Scrape promotions page of Arizona Charlie's Casino test
'''
import os
import re
import requests
from lxml import html

from scrapers import text_plus_newline, text_plus_linebreak


ABSPATH = os.path.abspath(__file__)

filename_with_ext = os.path.basename(ABSPATH)
filename, ext = filename_with_ext.split(".")

url = 'http://www.arizonacharliesdecatur.com'
promos_url = 'http://www.arizonacharliesdecatur.com/Events-Promotions/Casino-Promotions'

page = requests.get(promos_url)
tree = html.fromstring(page.text)

# xpath used to find a list of individual promo links
promos_xpath = "//div[contains(@class, 'linkz_panel_inner wig_1')]/div[contains(@class, 'linkz linkz-filez')]/p/a/@href"
promo_links = tree.xpath(promos_xpath)

# xpath used to get indiv promo title
indiv_title_xpath = "//div/p[contains(@class, 'font4')]"

# xpath used once on indiv promo page to get the promo description
indiv_desc_xpath = "//p[contains(@class, 'text-center')]"

strip_text_re = re.compile(r"^\s+", re.MULTILINE)


def main():
    with open("{}-output.md".format(filename), 'w', newline='') as f:
        f.write(text_plus_linebreak("# Arizona Charlie's Casino Promotions"))

        # loop thro promo pages
        for idx, link in enumerate(promo_links):

            try:
                indiv_url = url+link
                indiv_page = requests.get(indiv_url)
                indiv_tree = html.fromstring(indiv_page.text)

                f.write(text_plus_newline(
                    "### {}".format(tree.xpath(indiv_title_xpath)[idx].text_content())))

                # loop thro lines of text on indiv promo page
                for idx2, _ in enumerate(indiv_desc_xpath):
                    try:
                        text = indiv_tree.xpath(indiv_desc_xpath)[idx2].text_content()
                        f.write(text_plus_linebreak(strip_text_re.sub("", text)))
                    except IndexError:
                        # end of promo details
                        break

                # linespace in between promos
                f.write(text_plus_newline())

            except IndexError:
                # end of promos
                pass


if __name__ == '__main__':
    main()
