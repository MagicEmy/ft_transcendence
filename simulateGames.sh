#!/bin/bash
set -e

PLAYERS=( # add existing user_id strings here
"05736139-4ef6-4e36-a164-5967b6fcd01e"
"3771b12a-08c3-4baf-b0dc-f12078ab9c5e"
"29f9a878-5484-4c38-8299-b53de2ab0442"
"042d2dcf-9d7e-4e6a-85c5-d4f5d6de00d7"
"b1bd3831-e070-4c1e-9d28-654a4ca0242c"
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
