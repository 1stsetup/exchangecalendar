#!/bin/sh

usage() { echo "Usage: $0 [-u | -d ]" 1>&2;echo "-u:enable update";echo "-d:disable update"; exit 1; }

if [  $#  =  0 ];then
usage
fi

version=`sed -n -e "s/.*<em:version>\(.*\)<\/em:version>/\1/p" install.rdf`
while getopts  ":ud" OPTION
do
    case ${OPTION} in
        u) echo "update"  
	cat defaults/preferences/update_enable.txt > defaults/preferences/update.js
 	zip -r exchangecalendar-v$version.xpi * -x \*.git \*.xpi \*.sh  update\*.txt
	exit
	;;
        d) echo "no update" 
	cat defaults/preferences/update_disable.txt > defaults/preferences/update.js
 	zip -r exchangecalendar-v$version.xpi * -x \*.git \*.xpi \*.sh  update\*.txt
	exit
	;;
	*) usage ;; 
    esac
done 
 
usage

