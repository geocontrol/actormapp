FROM nodesource/node:4.0
ENV NODE_ENV=development

RUN useradd --user-group --create-home --shell /bin/false app &&\
  npm install --global npm
 
WORKDIR /usr/local/src
COPY package.json /usr/local/src/package.json
ADD . .
RUN chown -R app:app /usr/local/src 
USER app
RUN npm install
RUN npm run build 


CMD ["npm","start"]
