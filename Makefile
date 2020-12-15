build:
	git checkout master -- PRIVACY.md SUPPORT.md
	-rm *html
	pandoc -s PRIVACY.md -o privacy.html
	pandoc -s SUPPORT.md -o support.html
