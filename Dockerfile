FROM node

WORKDIR /app

COPY . /app
RUN npm install

# start app
CMD npm run-script backend; npm run dev
