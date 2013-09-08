EXT_NAME=pacer

all: clean pages package

pages: 
	jade jade/*.jade -Po .

watch:
	jade jade/*.jade -wPo .

clean:
	rm -rf *~
	rm -f $(EXT_NAME).zip

package: manifest.json
	zip -r $(EXT_NAME) * -x graphics/ graphics/* jade/ jade/* Makefile $(EXT_NAME).zip
