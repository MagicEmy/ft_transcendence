FROM postgres:bullseye

COPY ./utilities/init-user-db.sh /docker-entrypoint-initdb.d/init-user-db.sh

ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["postgres"]