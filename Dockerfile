FROM node:17.5.0

COPY . /src

WORKDIR /src

RUN npm install

EXPOSE 8003

CMD npm start