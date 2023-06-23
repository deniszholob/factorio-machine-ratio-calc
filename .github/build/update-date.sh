#!/bin/bash
# Update Date Script
# @author Denis Zholob (deniszholob.com)
#
# Writes the current date to file
# Ref:
# * https://renenyffenegger.ch/notes/Linux/shell/commands/date
# * https://stackoverflow.com/questions/17066250/create-timestamp-variable-in-bash-script
# ====================================== #

echo 'Update Date script started...'
now="$(date +%s)"
file="src/app/app-update.ts"
file_comment="// Auto Generated during deployment build //\n"
file_content="export const APP_UPDATE_DATE = %d; // Seconds since UNIX epoch.\n"
printf "$file_comment$file_content" "$now" > $file
echo "$now"
echo 'Update Date script finished...'
