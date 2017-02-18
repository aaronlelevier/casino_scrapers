# coding: utf-8
#!/usr/bin/python

'''
Scrape promotions page of Orleans Casino test
'''
import os
import re
import requests
from lxml import html

from scrapers import text_plus_newline, text_plus_linebreak


ABSPATH = os.path.abspath(__file__)

filename_with_ext = os.path.basename(ABSPATH)
filename, ext = filename_with_ext.split(".")

domain = 'http://www.orleanscasino.com'
url = 'http://www.orleanscasino.com/play/news-and-promotions'

new_page = requests.get('http://www.orleanscasino.com/play/news-and-promotions')
tree = html.fromstring(new_page.text)

# get promotion titles
promos = tree.xpath('//div[@class="page_content_main1 clearfix"]//b/text()')
promo_links = tree.xpath('//div[@class="sub_sections featured_items "]//a/@href')

pattern = r'[\w\d\.\:\,\-\_\'\"\!]+'


def re_write(s):
    "Regex to extract promo description text"
    try:
        return ' '.join(re.findall(pattern, ''.join(s)))
    except AttributeError:
        return ''


def main():
    with open(os.path.join("output", "{}.md".format(filename)), 'w', newline='') as f:
        f.write(text_plus_linebreak("# Orleans Casino Promotions"))

        for link in promo_links:
            # indiv page
            promo_page = requests.get(domain + link)

            # write: title, url, desc
            promo_tree = html.fromstring(promo_page.text)
            title = promo_tree.xpath('//div[@class="page_content_main"]//h1/text()')
            f.write("### {}".format(text_plus_newline(re_write(title))))

            # individual promo url
            f.write(text_plus_linebreak(promo_page.url))

            # promo details
            promo_info = promo_tree.xpath('//div[@class="page_content_main2 clearfix"]/text()')
            f.write(text_plus_linebreak(re_write(promo_info)))

            #line spacer
            f.write('')


if __name__ == '__main__':
    main()
