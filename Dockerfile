FROM node:14-slim

RUN		apt-get update
RUN 	apt-get install -y --fix-missing \
					npm
RUN		apt-get clean \
	&&	rm -rf /var/lib/apt/lists/*

WORKDIR	/shared
RUN		npm install

EXPOSE	3000
# EXPOSE	$PORT

CMD [ "npm", "start" ]
# CMD ["tail", "-f", "/dev/null"]
