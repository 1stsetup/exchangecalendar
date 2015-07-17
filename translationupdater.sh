#!/bin/bash
 
declare -a LOCALEFILES 
declare -a LOCALEFOLDERS 

declare -a ELOG

ECOUNT=0

LOCALEROOT=""
LOCALEFILESCOUNT=0
LOCALEFOLDERSCOUNT=0

LOCALEROOT=""  
ENUSFOLDERPATH=""
function IsFolder(){
	DIR=$1
	[ -d $DIR ] && [ -n $DIR ] && echo "true" || echo "false"	 
}

function IsFile(){
	FILE=$1
	[ -f $FILE ] && [ -n $FILE ] && echo "true" || echo "false"	
}

function LogLine(){
	[ -n "$1" ] &&echo -en "\n$1"  
}

function LogError(){  
	echo -en "\nERROR:- $1."
	echo -en "\n"
	exit 1 
}

function GetLocaleFolder(){
	if [ "$(IsFolder $LOCALEROOT)" = "false" ];then
	LogError "Not a valid locale folder"
	fi	
	LOCALEFOLDERS=( $( find $LOCALEROOT -maxdepth 1 -type d | sed "s|^$LOCALEROOT/||" ) )
}
 
function GetEnUsFiles(){
	if [ "$(IsFolder $ENUSFOLDERPATH)" = "false" ];then
	LogError "Locale(en-US) Path is not valid"
	fi	
	
	LOCALEFILES=( $( find $ENUSFOLDERPATH  -type f 	 -name "*.dtd" | sed "s|^$ENUSFOLDERPATH/||" ) )
}
 
function CopyMissingFiles(){
	 LogLine "\n**Copying missing files from en-Us"
	
	stage=0
	#loop each locale folder
	for FLDR in "${LOCALEFOLDERS[@]}"
	do	
			MissingCount=0
			TEMPFOLDER=""
			TEMPFOLDER="$LOCALEROOT/$FLDR"
			 			
 			[  $LOCALEROOT = "$FLDR" ]	 && continue
			[  $TEMPFOLDER = $ENUSFOLDERPATH  ]	 && continue 
			[ "$( IsFolder $TEMPFOLDER)" = "false" ] && continue
		
			LogLine "\n[$((++stage))]Checking for missing files in Locale Folder $FLDR"
			
			#loop each file in en-us folder with others
			for FLS in "${LOCALEFILES[@]}"
			do
				TEMPFILE=""
				TEMPFILE="$TEMPFOLDER/$FLS"
									
				ENFILE=""
				ENFILE=$ENUSFOLDERPATH/$FLS
				
				if [ "$(IsFile $TEMPFILE)" = "true" ];then
					:
				else			
						((MissingCount++))
						#lets copy the missing files
						status="fail"  
						cp  "$ENFILE" "$TEMPFILE"
						if [ $? -eq 0 ];then
							status="success"
						fi
						ELOG[$((ECOUNT++))]="cp: $ENFILE --> $TEMPFILE -- $status"
				fi
						
			done	
			[ $MissingCount -gt 0 ] &&	LogLine "MissingCount: $MissingCount" 	
	done
}

function CopyMissingTranslation(){
	 LogLine "\n**Copying missing tranlation from en-Us files"
	stage=0
	#loop each locale folder
	for FLDR in "${LOCALEFOLDERS[@]}"
	do	
			TEMPFOLDER=""
			TEMPFOLDER="$LOCALEROOT/$FLDR"
			 			
 			[  $LOCALEROOT = "$FLDR" ]	 && continue
			[  $TEMPFOLDER = $ENUSFOLDERPATH  ]	 && continue 
			[ "$( IsFolder $TEMPFOLDER)" = "false" ] && continue
		
			LogLine "\n[$((++stage))]Checking for missing translation in Locale Folder $FLDR"
			
			#loop each file in en-us folder with others
			for FLS in "${LOCALEFILES[@]}"
			do
				TEMPFILE=""
				TEMPFILE="$TEMPFOLDER/$FLS"
									
				ENFILE=""
				ENFILE=$ENUSFOLDERPATH/$FLS
				
				if [ "$(IsFile $TEMPFILE)" = "true" ];then 
					#process one file in en-Us at a time with current locale folder
					declare -a ENLINE
					MissingCount=0 
					while read ENLINE
					do 
 						
						#convert line to array
						declare -a LINEARR=(`echo "$ENLINE"`) 
										
						#we know that fild 1 is identifier in dtd file 
    					IDENTIFIER=${LINEARR[1]}	
    					
    					grep  "$IDENTIFIER" "$TEMPFILE"  >/dev/null 
    					if [ $? -eq 0 ];then
    						:
    					else
    						 ((MissingCount++))    						 
    						#lets copy the missing files
							status="fail"  
     						echo "$ENLINE" >> $TEMPFILE 
							if [ $? -eq 0 ];then
								status="success"
							fi
    						ELOG[$((ECOUNT++))]="+>> $IDENTIFIER --> $TEMPFILE -- $status"    												 
    					fi    			
					done<$ENFILE   
					[ $MissingCount -gt 0 ] &&	LogLine "$TEMPFILE\nMissingCount: $MissingCount" 		 
				else	
					:		 
				fi
						
			done	
	done
}

function ExtaLog(){
			LogLine "\n**More Logs:"
			
			for Line in "${ELOG[@]}"
			do
				LogLine "$Line"
			done
}
 
#Propmt for path
ROOT=$1

[ $# -lt 1 ] && LogError "Input Required. Exit"

if [ "$(IsFolder $ROOT)" = "false" ];then
	LogError "Folder \"$ROOT\" is invalid"
fi 

LogLine "ROOT Set to $ROOT"   
LOCALEROOT="$ROOT/locale/exchangecalendar"
LogLine "Locale Path: $LOCALEROOT" 
ENUSFOLDERPATH="$LOCALEROOT/en-US"
LogLine "en-US Locale Path: $ENUSFOLDERPATH"  

#GetLocaleFolder
GetLocaleFolder
LOCALEFOLDERSCOUNT=${#LOCALEFOLDERS[@]} 
#echo -en  "c" ${#LOCALEFOLDERS[@]} ${LOCALEFOLDERS[@]}

if [ ${#LOCALEFOLDERSCOUNT[@]} -lt 1  ] ; then
LogError "Locale Folder not found"
fi

GetEnUsFiles
LOCALEFILESCOUNT=${#LOCALEFILES[@]} 
#echo -en  "c" ${#LOCALEFILES[@]} ${LOCALEFILES[@]}

if [ ${#LOCALEFILESCOUNT[@]} -lt 1  ] ; then
LogError "Locale files not found"
fi
#lets copy missing locale file in other folders from en-Us
CopyMissingFiles 

#lets copy missing locale translation to other files from en-Us 
CopyMissingTranslation

if [ ${#ELOG[@]} -gt 0  ] ; then
LogLine ""
read -n 1 -p 'Do you see extra logs [y/N?]' REPLY
[ "$REPLY" = "y" ] && ExtaLog

LogLine "\n--->Log Wrtitten to /tmp/ExtraLog"
echo -en "${ELOG[@]} " > /tmp/ExtraLog
fi
 
echo -ne "\n"
