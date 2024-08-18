DOCKER :=	docker
DCKR_COMP :=	${DOCKER}-compose

all:
	$(DCKR_COMP) up --build

build start up stop kill down:
	$(DCKR_COMP) $@

daemon:
	${DCKR_COMP} up -d

clean: down
	$(DOCKER) rmi $(shell $(DOCKER) images -aq) | true
	$(DOCKER) volume rm $(shell $(DOCKER) volume ls -q) | true

fclean: clean
	$(DOCKER) system prune -af
	$(DOCKER) volume prune -f

#volumes that are no longer associated with containers after a docker system prune,

re: fclean all

.PHONY: all build start up stop kill down daemon clean fclean re
