rm -rf public
rm -rf build
cp -R ../public .

../node_modules/.bin/electron-packager ./ --all --icon=./public/img/icons/icon --overwrite=true --out=build --asar=true

rm -rf ./public