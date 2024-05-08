#!/bin/bash
set -e

PLAYERS=( # add existing user_id strings here
"27244093-f22e-4104-aacb-cb5cf44572c5"
"67ddac8f-a79e-4b83-85bc-baa385c6b43d"
"6e63c8b6-e894-44f7-9cc6-8a9cc422479f"
"e79e07f5-39e5-43ed-9b04-039c69bfe114"
"decb95d5-777b-4d3d-82cb-e4214af7528c"
)


for ((i = 0; i < ${#PLAYERS[@]}; i++ ))
do
# simulating a game against a bot
	curl --location 'localhost:3006/game' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'player1_id='${PLAYERS[i]} \
--data-urlencode 'player2_id=bot' \
--data-urlencode 'player1_score='$(($RANDOM % 16)) \
--data-urlencode 'player2_score='$(($RANDOM % 16)) \
--data-urlencode 'duration='$(($RANDOM * 1000 % 7000001 + 200000)) \
--data-urlencode 'status=completed'
	for ((j = i + 1; j < ${#PLAYERS[@]}; j++))
	do
	# simulating between 1 and 10 games against a human
		REPEAT=$(($RANDOM % 10 + 1))
		echo "."
		for ((k = 0; k < $REPEAT; k++))
		do
			curl --location 'localhost:3006/game' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'player1_id='${PLAYERS[i]} \
--data-urlencode 'player2_id='${PLAYERS[j]} \
--data-urlencode 'player1_score='$(($RANDOM % 16)) \
--data-urlencode 'player2_score='$(($RANDOM % 16)) \
--data-urlencode 'duration='$(($RANDOM * 1000 % 7000001 + 200000)) \
--data-urlencode 'status=completed'
			sleep 0.5
		done
	done
done
