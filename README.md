# Slovene Thesaurus and Collocations dictionary app

This application is an **unofficial** offline viewer of the:

* Thesaurus of modern Slovene language
* Collocations Dictionary of Modern Slovene

Download the app:

* For iOS: <https://apps.apple.com/us/app/slovene-thesaurus/id1544614699>
* For Android: <https://play.google.com/store/apps/details?id=hr.scio.slo>

## App License

This application is licensed under the Apache License, Version 2.0.

## Dictionaries Licenses

The dictionaries are released under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) by the researchers of the Centre for Language Resources and Technologies at the University of Ljubljana (<https://www.cjvt.si/en/>).

Thesaurus Authors: Simon Krek, Cyprian Laskowski, Marko Robnik Šikonja, Iztok Kosem, Špela Arhar Holdt, Polona Gantar, Jaka Čibej, Vojko Gorjanc, Bojan Klemenc, Kaja Dobrovoljc (more info: <https://viri.cjvt.si/sopomenke/eng/about>)

Collocations authors: Iztok Kosem, Polona Gantar, Simon Krek, Špela Arhar Holdt, Jaka Čibej, Cyprian Laskowski, Eva Pori, Bojan Klemenc, Kaja Dobrovoljc, Vojko Gorjanc, Nikola Ljubešić (<https://viri.cjvt.si/kolokacije/eng/about>)

This mobile application is an...

* **unofficial**,
* **offline**,
* and **simplified**

...viewer of those dictionaries. The official version is available on <https://viri.cjvt.si> and contains a more advanced viewer for synonyms and collocations.

The main reason why this application exists is so that you have a quick way to search those databases on your phone. Even without internet connection.

## Development

This app is written in react-native using Typescript and Expo SDK. The database importer (<https://github.com/tkrajina/slo-dictionary-importer>) is written in Golang.

### Importing the databases

The database needed to run the application **isn't part of this repository**. In order to start the app locally you need to download the data and import it into a local sqlite database. 

Install Golang (<https://golang.org/dl/>) and then:

    go get github.com/tkrajina/slo-dictionary-importer
    cd $GOPATH/github.com/tkrajina/slo-dictionary-importer
    make download
    make build-db

The database might take a few minutes to build.

### Running the app

Install all the dependencies:

    npm install --global expo-cli
    npm install

Import the local database (see previous section on how to build it), run:

    make import-db

That will create a file in `assets/db/dict.sqlite`. You can inspect it with `sqlite3 assets/db/dict.sqlite`.

If you have local iOS/Android simulators installed on your computer, you can test the app with:

    make expo-ios

...or...

    make expo-android

Otherwise you can use the Expo client (<https://expo.io/tools#client>) to test/develop the app on a real device.