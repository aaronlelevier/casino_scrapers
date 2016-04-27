FROM python:3.4
ENV PYTHONUNBUFFERED 1
RUN mkdir -p /bsrs/bsrs-django/
WORKDIR /bsrs/bsrs-django
ADD . /bsrs/bsrs-django/
RUN pip install -r requirements.txt
