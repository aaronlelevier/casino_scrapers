# coding: utf-8
#!/usr/bin/python

'''
Scrape promotions page of Orleans Casino test
'''
import re
import requests
from lxml import html


class nFile(file):
    "Adds newline onto the end of all writes."

    def __init__(self, name, mode = 'r'):
        self = file.__init__(self, name, mode)

    def write(self, string):
        self.writelines(string + '\n')


def re_write(s):
    "Abstract Regex find logic used b/4 writing to the file"
    try:
        return ' '.join(re.findall(pattern, ''.join(s).encode('utf-8')))
    except AttributeError:
        return ''


domain = 'http://www.orleanscasino.com'
url = 'http://www.orleanscasino.com/play/news-and-promotions'

new_page = requests.get('http://www.orleanscasino.com/play/news-and-promotions')
tree = html.fromstring(new_page.text)

# get promotion titles
promos = tree.xpath('//div[@class="page_content_main1 clearfix"]//b/text()')
promo_links = tree.xpath('//div[@class="sub_sections featured_items "]//a/@href')

pattern = r'[\w\d\.\:\,\-\_\'\"\!]+'


def main():
    f = nFile('outfile-orleans.txt', 'w')

    for link in promo_links:
        # indiv page
        promo_page = requests.get(domain + link)

        # write: title, url, desc
        promo_tree = html.fromstring(promo_page.text)
        title = promo_tree.xpath('//div[@class="page_content_main"]//h1/text()')
        f.write(re_write(title))

        # individual promo url
        f.write(promo_page.url)

        # promo details
        promo_info = promo_tree.xpath('//div[@class="page_content_main2 clearfix"]/text()')
        f.write(re_write(promo_info))

        #line spacer
        f.write('')

    f.close()


if __name__ == '__main__':
    main()
