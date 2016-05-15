# FROM python:3.4
# ENV PYTHONUNBUFFERED 1
# RUN mkdir -p /bsrs/bsrs-django/
# RUN mkdir -p /scripts/
# WORKDIR /bsrs-django
# ADD . /bsrs-django/
# ADD /scripts/ /scripts/
# RUN pip install -r bsrs-django/requirements.txt

FROM base
MAINTAINER Scott Newcomer

# run tests && build application artifacts
#compile python pkg dependencies.  python-dev builds python pkgs from source

RUN apt-get update && \
    apt-get install -qy -y python3-dev python-dev git

RUN . /appenv/bin/activate && \
    pip install wheel --upgrade

ENV WHEELHOUSE=/wheelhouse PIP_WHEEL_DIR=/wheelhouse PIP_FIND_LINKS=/wheelhouse XDG_CACHE_HOME=/cache

VOLUME /wheelhouse
VOLUME /reports

COPY scripts/test.sh /usr/local/bin/test.sh
RUN chmod +x /usr/local/bin/test.sh

# override entrypoint of parent image
ENTRYPOINT ["test.sh"]
CMD ["python", "manage.py", "test", "--noinput"]

COPY . /application
WORKDIR /application
