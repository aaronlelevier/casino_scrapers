FROM python:3.4
ENV PYTHONUNBUFFERED 1
RUN mkdir -p /bsrs/bsrs-django/
RUN mkdir -p /scripts/
WORKDIR /bsrs/bsrs-django
ADD . /bsrs/bsrs-django/
ADD /scripts/ /scripts/
RUN pip install -r bsrs-django/requirements.txt
