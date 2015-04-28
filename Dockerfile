FROM ubuntu:14.04

MAINTAINER Daniel Kokott <dako@berlingskemedia.dk>

# Installing wget and python. Python is needed to Postgress support.
RUN apt-get update
RUN apt-get install -y wget python

# Downloading and installing Node.
RUN wget -O - http://nodejs.org/dist/v0.10.29/node-v0.10.29-linux-x64.tar.gz \
    | tar xzf - --strip-components=1 --exclude="README.md" --exclude="LICENSE" \
    --exclude="ChangeLog" -C "/usr/local"

# Set the working directory.
WORKDIR /songcontests

# Copying the code into image. Be aware no config files are included.
COPY ./src /songcontests/src
COPY ./node_modules /songcontests/node_modules

# Exposing our endpoint to Docker.
EXPOSE  8000

# When starting a container with our image, this command will be run.
CMD ["node", "src/server.js"]