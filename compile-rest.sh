#!/bin/bash

for files in static/js/underscore-min.js static/js/jquery.min.js static/js/backbone-min.js static/js/rest-dev.js; do
    if [ ! -f ${files} ]; then
        echo "missing ${files}. Are you in right directory?"
        exit
    fi
done

java -jar ~/bin/compiler.jar --js static/js/underscore-min.js \
                             --js static/js/jquery.min.js     \
                             --js static/js/backbone-min.js   \
                             --js static/js/rest-dev.js --js_output_file static/js/rest-prod.js
