FROM node:20



WORKDIR /fileapp

COPY ./package.json /fileapp

RUN npm install

COPY . /fileapp

VOLUME /app/uploads 

EXPOSE 3001

CMD ["node", "app.js"]
