build:
	git checkout master -- PRIVACY.md SUPPORT.md
	pandoc -s PRIVACY.md -o PRIVACY.html
	pandoc -s SUPPORT.md -o SUPPORT.html
