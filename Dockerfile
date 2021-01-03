FROM  node:12-alpine

RUN yarn global add @quasar/cli
RUN mkdir /srv/app

WORKDIR /srv/app

EXPOSE 8080

CMD quasar dev
