#!/usr/bin/env python

from setuptools import setup

setup(
    name='Casino Scrapers',
    version='0.0.2',
    description='Misc. Casino Scrapers',
    author='Aaron Lelevier',
    author_email='pyaaron@gmail.com',
    license='MIT',
    packages=['scrapers'],
    install_requires=[
        'lxml',
        'requests'
    ]
)