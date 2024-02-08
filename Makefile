
COMPOSE_FILE :=	docker-compose.yml

# IMAGES += mariadb
# IMAGES += nginx
# IMAGES += wordpress

all: up

compose:
	docker-compose -f $(COMPOSE_FILE) build

up: compose
	docker-compose -f $(COMPOSE_FILE) up -d

show:
	@echo "\n Images:"
	@docker images -a
	@echo "\n Containers: "
	@docker ps -a
	@echo "\n Volumes: "
	@docker volume ls
	@echo "\n Networks: "
	@docker network ls

down:
	docker-compose -f $(COMPOSE_FILE) down

kill:
	docker-compose -f $(COMPOSE_FILE) kill

re: down
	docker-compose -f $(COMPOSE_FILE) build --no-cache
	docker-compose -f $(COMPOSE_FILE) up -d

clean:
	docker-compose -f $(COMPOSE_FILE) down --rmi all

fclean: kill
	docker-compose -f $(COMPOSE_FILE) down --rmi all -v --remove-orphans

.PHONY: all compse up show down kill re clean fclean
