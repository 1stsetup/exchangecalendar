#!/bin/sh

version=`sed -n -e "s/.*<em:version>\(.*\)<\/em:version>/\1/p" install.rdf`
zip -r exchangecalendar-$version.xpi * -x \*.git \*.xpi \*.sh
