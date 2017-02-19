# README

This is an example project for web scraping using Python.

There is currently one example script to scrape [The Orleans Casino](http://www.orleanscasino.com/) in Las Vegas, NV Casino promotions.

## Installation

This project uses Python 3.

Make sure that Python 3 is installed.

Install a python [virtualenv](http://docs.python-guide.org/en/latest/dev/virtualenvs/) with Python 3. Activate `virtualenv`

Install dependencies:

```
python setup.py install
```

## Running the scripts

Simply run the following. An output file will be generated with the current casino's promotions.

```
python scrapers/orleans.py
```

## Running and testing locally

`pip install -r requirements.txt` to run and debug locally.

## License

MIT