#!/bin/bash
set -e

PLAYERS=( # add existing user_id strings here
"49f1c80c-a53c-41ed-adec-c0a0ca73a7ba"
"d1377a9e-bed0-48dd-96b8-381212ab04ac"
"74774914-b5af-46cc-89f3-a5372b97b9ca"
"1aa76997-ee3a-4abe-8a47-0d2711af72a1"
"bdf86603-8c27-4148-b02f-1d914a2924f0"
"a1cbfce4-8fe9-4c9d-bcbd-f879fadbd286"
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
