js:
	browserify content_script.js -o content_script_browserify.js
	browserify setting.js -o setting_browserify.js
	browserify background.js -o background_browserify.js


#
# Chromeエクステンション公開用のzipを作る
#

ZIPFILES=\
	manifest.json \
	background_browserify.js \
	content_script_browserify.js \
	setting_browserify.js \
	setting.html \
	jquery-2.1.4.min.js \
	ds-16.png \
	ds-32.png \
	ds-48.png \
	ds-96.png \
	ds-128.png \
	ds-192.png

zip: js
	/bin/rm -f ds.zip
	zip -r ds.zip ${ZIPFILES}

