FROM python:3.4

MAINTAINER Scott Newcomer

# prevent dpkg errors
ENV TERM=xterm-256color

# not using pip to install virtual env b/c operating system pkg manager at system level to ekeep application env separate
RUN apt-get update && \
    apt-get install -y git && \
    apt-get install -y \
    -o APT::Install-Recommend=false -o APT::Install-Suggests=false \
    python python-virtualenv libpython2.7

RUN virtualenv /appenv && \
    . /appenv/bin/activate && \
    pip install pip --upgrade

# activate environment
ADD scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]

LABEL application=bsrs
