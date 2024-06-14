all: up

build start up stop kill down:
	docker-compose $@

# up:
# 	docker-compose up

# down:
# 	docker-compose down

# start:
# 	docker-compose start

# stop:
# 	docker-compose stop

clean: down
	docker rmi $(shell docker images -q)
	docker volume rm $(shell docker volume ls -q)

fclean: clean
	docker system prune -af
	docker volume prune -f

#volumes that are no longer associated with containers after a docker system prune,

re: fclean all

.PHONY: all up down start stop clean fclean re
