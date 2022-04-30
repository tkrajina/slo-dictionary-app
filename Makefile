ANDROID_SDK_ROOT=~/Library/Android/sdk
XCODE_APPS=/Applications/Xcode.app/Contents/Developer/Applications
IMPORTER_PATH=${GOPATH}/src/github.com/tkrajina/slo-dictionary-importer

.PHONY: generate-images
generate-images:
	tools/create_pngs.sh

.PHONY: yarn-reinstall
yarn-reinstall:
	rm -Rf node_modules
	yarn install

.PHONY: yarn-install
yarn-install:
	yarn install --frozen-lockfile

.PHONY: tsc-watch
tsc-watch: clean
	yarn run tsc-watch

.PHONY: lint
lint:
	yarn run lint

.PHONY: clean
clean:
	rm -Rf build

.PHONY: prettier
prettier:
	./node_modules/.bin/prettier --write $$(find src -name "*.ts*")

.PHONY: expo
expo:
	expo start

####################################################################################################

.PHONY: build-db
build-db:
	cd $(IMPORTER_PATH) && make build-db

.PHONY: import-db
import-db:
	mkdir -p assets/db
	cp $(IMPORTER_PATH)/dict.sqlite3 assets/db/dict.sqlite

.PHONY: build-and-import-db
build-and-import-db: build-db import-db
	echo "OK"

####################################################################################################

.PHONY: ios-simulator
ios-simulator:
	open $(XCODE_APPS)/Simulator.app/

.PHONY: android-simulator
android-simulator:
	$(eval AVD := $(shell $(ANDROID_SDK_ROOT)/emulator/emulator -list-avds | gshuf | head -1))
	$(ANDROID_SDK_ROOT)/emulator/emulator @$(AVD) &

.PHONY: expo-ios
expo-ios: ios-simulator
	expo start --ios

.PHONY: expo-android
expo-android: android-simulator
	expo start --android

.PHONY: assert-all-commited
assert-all-commited:
	$(eval GIT_PORCELAIN_STATUS := $(shell git status --porcelain))
	if [ -n "$(GIT_PORCELAIN_STATUS)" ]; \
	then \
	    echo 'YOU HAVE UNCOMMITED CHANGES'; \
	    git status; \
	    exit 1; \
	fi

.PHONY: build
build: build-android build-ios
	echo "OK"

.PHONY: build-android
build-android: assert-all-commited
	expo build:android

.PHONY: build-ios
build-ios: assert-all-commited
	expo build:ios
