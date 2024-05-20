FROM ubuntu:20.04

ARG FUNCTION_DIR="/function"

RUN mkdir -p ${FUNCTION_DIR}
RUN mkdir -p /tmp/out
COPY requirements.txt ${FUNCTION_DIR}/
COPY make_new_character.py ${FUNCTION_DIR}/
COPY *.png ${FUNCTION_DIR}/

RUN apt-get clean
RUN apt-get update && \
    apt-get install --no-install-recommends -y \
    python3.8 python3-pip python3-setuptools \
    python3-opencv python3-numpy \
    && rm -rf /var/lib/apt/lists/*

WORKDIR ${FUNCTION_DIR}
RUN python3.8 -m pip install -U pip && \
    python3.8 -m pip install -r requirements.txt -t ${FUNCTION_DIR}


ENTRYPOINT [ "/usr/bin/python3.8", "-m", "awslambdaric" ]
CMD ["make_new_character.handler" ]