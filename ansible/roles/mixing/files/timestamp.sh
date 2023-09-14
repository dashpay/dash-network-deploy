#!/bin/bash

while read x; do
	echo -n `date -Is`;
	echo -n " ";
	echo $x;
done
