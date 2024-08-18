all:
	docker-compose up --build

build start up stop kill down:
	docker compose $@

clean: down
	docker rmi $(shell docker images -q)
	docker volume rm $(shell docker volume ls -q)

fclean: clean
	docker system prune -af
	docker volume prune -f

#volumes that are no longer associated with containers after a docker system prune,

re: fclean all

.PHONY: all build start up stop kill down clean fclean re
