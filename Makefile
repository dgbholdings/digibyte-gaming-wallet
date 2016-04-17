VERSION=`cut -d '"' -f2 $BUILDDIR/../version.js`

sign:
	gpg -u 1112CFA1 --output browser-extensions/chrome/digibyte-gaming-chrome-extension.zip.sig --detach-sig browser-extensions/chrome/digibyte-gaming-chrome-extension.zip
verify: 
	gpg --verify browser-extensions/chrome/digibyte-gaming-chrome-extension.zip.sig browser-extensions/chrome/digibyte-gaming-chrome-extension.zip

sign-desktop:
	gpg -u 1112CFA1 --output webkitbuilds/DigiByte-Gaming-linux.zip.sig --detach-sig webkitbuilds/DigiByte-Gaming-linux.zip
	gpg -u 1112CFA1 --output webkitbuilds/DigiByte-Gaming-osx.dmg.sig --detach-sig webkitbuilds/DigiByte-Gaming-osx.dmg
	gpg -u 1112CFA1 --output webkitbuilds/DigiByte-Gaming-win.exe.sig --detach-sig webkitbuilds/DigiByte-Gaming-win.exe

verify-desktop:
	gpg --verify webkitbuilds/DigiByte-Gaming-linux.zip.sig webkitbuilds/DigiByte-Gaming-linux.zip
	gpg --verify webkitbuilds/DigiByte-Gaming-osx.dmg.sig webkitbuilds/DigiByte-Gaming-osx.dmg
	gpg --verify webkitbuilds/DigiByte-Gaming-win.exe.sig webkitbuilds/DigiByte-Gaming-win.exe

chrome:
	browser-extensions/chrome/build.sh

cordova-base:
	grunt dist-mobile

# ios:  cordova-base
# 	make -C cordova ios
# 	open cordova/project/platforms/ios/Copay
#
# android: cordova-base
# 	make -C cordova run-android
#
# release-android: cordova-base
# 	make -C cordova release-android
#
wp8-prod:
	cordova/build.sh WP8 --clear
	cordova/wp/fix-svg.sh
	echo -e "\a"

wp8-debug:
	cordova/build.sh WP8 --dbgjs
	cordova/wp/fix-svg.sh
	echo -e "\a"

ios-prod:
	cordova/build.sh IOS --clear
	cd cordova/project && cordova build ios
	open cordova/project/platforms/ios/DigiByte Gaming Wallet.xcodeproj

ios-debug:
	cordova/build.sh IOS --dbgjs
	cd cordova/project && cordova build ios
	open cordova/project/platforms/ios/DigiByte Gaming Wallet.xcodeproj

android-prod:
	cordova/build.sh ANDROID --clear
	cd cordova/project && cordova build android --release
	jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../copay.keystore -signedjar cordova/project/platforms/android/build/outputs/apk/android-release-signed.apk  cordova/project/platforms/android/build/outputs/apk/android-release-unsigned.apk copay_play 
	../android-sdk-macosx/build-tools/21.1.1/zipalign -v 4 cordova/project/platforms/android/build/outputs/apk/android-release-signed.apk cordova/project/platforms/android/build/outputs/apk/android-release-signed-aligned.apk 
	

android-debug:
	cordova/build.sh ANDROID --dbgjs --clear
	cd cordova/project && cordova run android

android-debug-fast:
	cordova/build.sh ANDROID --dbgjs
	cd cordova/project && cordova run android	
