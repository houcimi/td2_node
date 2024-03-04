FROM node:14

WORKDIR /src

COPY . .


RUN npm install


EXPOSE 3000

CMD npm start 
