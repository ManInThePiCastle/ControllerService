FROM node:boron

COPY www /usr/src/app
WORKDIR /usr/src/app
RUN npm install
EXPOSE 80
CMD [ "npm", "start" ]