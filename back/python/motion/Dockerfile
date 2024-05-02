FROM public.ecr.aws/lambda/python:3.8

# Copy requirements.txt & other dependencies 
COPY requirements.txt ${LAMBDA_TASK_ROOT}
COPY AnimatedDrawings ${LAMBDA_TASK_ROOT}
COPY out /tmp/out

# Install the specified packages
RUN yum install -y mesa-libGL mesa-libGL-devel mesa-libGLU mesa-libGLU-devel
RUN yum install -y libX11 libX11-devel libXext libXext-devel libXtst libXtst-devel
RUN yum install -y libXrender libXrender-devel libXcomposite libXcomposite-devel libXcursor libXcursor-devel
RUN yum install -y libXi libXi-devel libXrandr libXrandr-devel libXinerama libXinerama-devel
RUN yum install -y gcc freeglut3-dev freeglut-devel mesa-dri-drivers PyOpenGL mesa-libOSMesa-devel

# RUN yum -y install mesa-libGL-devel mesa-libOSMesa-devel
RUN pip install --upgrade pip
RUN pip install wheel
RUN pip install -r requirements.txt -t ${LAMBDA_TASK_ROOT}

ENV DISPLAY=:0

# Copy function code
COPY lambda_function.py ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "lambda_function.handler" ]
