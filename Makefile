build:
	git checkout master -- PRIVACY.md
	pandoc -s PRIVACY.md -o PRIVACY.html
