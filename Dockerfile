FROM nodesource/node:4.0

ADD package.json package.json
RUN npm install
RUN npm install -g bower
RUN npm install --global browserify
ADD . .

CMD ["npm","start"]
