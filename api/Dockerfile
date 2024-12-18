# Builder
FROM golang:1.23-alpine AS builder
ENV GIN_MODE=release

COPY app/ /srv/smartimoveis-api

WORKDIR /srv/smartimoveis-api
RUN go mod vendor
RUN go build -mod=vendor

RUN cp smartimoveis-api /usr/bin/smartimoveis-api

# Application
FROM alpine:3.16
ENV PATH="${PATH}:/usr/bin"

RUN apk add git
RUN apk add gcc libc-dev

RUN mkdir -p /srv/smartimoveis-api

COPY --from=builder /usr/bin/smartimoveis-api /usr/bin/smartimoveis-api

WORKDIR /srv/smartimoveis-api
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*

CMD [ "smartimoveis-api" ]