// Colorizing items in the My Drawer.
// Lee, KyungJoon. alogblog.com@gmail.com
// v.1.0 

// Customizing constants.
var NON_ALPHABET_DIVS = [];
// For examples.
// Korean: ['°¡', '¶ó', '»ç', 'Â÷']
// Chinese: ['ìé', '?', '?', '?', 'é¥', '÷Ü']
// Japanese: ['ª¢', 'ªµ', 'ªÊ', 'ªÞ', 'ªé']

// Constants.
var IDX_ID = 0;
var IDX_COLOR = 1;
var SPACE = ' ';

// Global var.
var SwitchingColor = 0;
var StartFromNewLine = confirm('Want app blocks to start from new line?');
var Alpha = prompt('Alpha of bgColor(0~255)', 100);
if (Alpha < 0) Alpha = 0;
if (Alpha > 255) Alpha = 255;
var GapDiv = prompt('Margin(px) between blocks', 5);
var GapApp = prompt('Margin(px) between apps', 1);

setTimeout(function() {
	var ad = LL.getContainerById(99);
	var apps = ad.getItems();
	var app, box;
	var color, prevColor;
	var ch, prevCh;
	var x, y;
	var firstCol;
	var nonAlphabetDiv;
	var ml, mt, mr, mb;
	var colN;
	var drawerArr;

	colN = ad.getProperties().getInteger('gridPColumnNum' );
	drawerArr = new Array();
	prevCh = null;
	nonAlphabetDiv = NON_ALPHABET_DIVS.shift() ;
	drawerArr.push( new Array(colN) );	
	x = -1;
	y = 0;

	for(i=0; i<apps.getLength(); i++) {
		app = apps.getAt(i);
		gotoNewLine = false;

		ch = app.getLabel().substring(0,1).toLowerCase();
		// "&nbsp; char" --> normal space.
		if(ch.charCodeAt(0) == 160) ch = SPACE;

		if( ch == prevCh ) {
			color = prevColor;
		}
		else {
			// Numbers.
			if( ch < 'a' ) {
				if( prevCh == null) {
					color = prevColor = getColorCode();
				}
			}
			// Non Alphabet.
			else if( ch > 'z' ) {
				if ( ch >= nonAlphabetDiv ) {
					nonAlphabetDiv = NON_ALPHABET_DIVS.shift();
					
					color = prevColor = getColorCode();
					gotoNewLine = true;
				}
			}
			// Ascii a~z.
			else if( ch >= 'a' && ch <= 'z' ) {
				color = prevColor = getColorCode();
				gotoNewLine = true;
			}
			prevCh = ch;
		}
		
		++x;
		if ( x == colN || (StartFromNewLine && gotoNewLine) ) {
			for(var xx=x; xx<colN; xx++) {
				drawerArr[y][xx] = null;
			}
			x = 0;
			y = y + 1;
			drawerArr.push( new Array(colN) );
		}
		drawerArr[y][x] = [ app.getId(), color ];

		if(StartFromNewLine) {
			try {
				// On exit from App Drawer, 'load' event handler was also run,
				// and setCell API caused an error msg.
				app.setCell(x, y, x+1, y+1);
			} catch(e) {}
		}	
	}


	for(y=0; y<drawerArr.length; y++) {
		for(x=0; x<drawerArr[y].length;x++) {
		
			if(null == drawerArr[y][x]) continue;

			app = ad.getItemById(drawerArr[y][x][IDX_ID]);
			editor = app.getProperties().edit();
			box = editor.getBox('i.box');
			color = drawerArr[y][x][IDX_COLOR];
			box.setColor('c', 'n', color);

			ml = mt = mr = mb = GapDiv;

			// left.
			if(x == 0) {
				ml = 0;
			}
			else if(drawerArr[y][x-1][IDX_COLOR] == color) {
				ml = GapApp;
			}
			box.setSize('ml', ml);

			// right.
			if(x == colN-1) {
				mr = 0;
			}
			else if( null == drawerArr[y][x+1] || drawerArr[y][x+1][IDX_COLOR] == color ) {
				mr = GapApp;
			}
			box.setSize('mr', mr);

			// top.
			if(y == 0) {
				mt = 0;
			}
			else if(null != drawerArr[y-1][x] && drawerArr[y-1][x][IDX_COLOR] == color) {
				mt = GapApp;
			}
			box.setSize('mt', mt);
			
			// bottom.
			if(y == drawerArr.length-1) {
				mb = 0;
			}
			else if(null != drawerArr[y+1][x] && drawerArr[y+1][x][IDX_COLOR] == color) {
				mb = GapApp;
			}
			else if(undefined == drawerArr[y+1][x] && (null != drawerArr[y+1][0] && drawerArr[y+1][0][IDX_COLOR] == color) ) {
				mb = GapApp;
			}
			box.setSize('mb', mb);

			editor.commit();
		}
	}
	Android.makeNewToast( 'Colorizing ended...', true ).show();
}, 100);

function getColorCode() {
//	return getColorCodeByRGB();
	return getColorCodeByHSL();
}

function getColorCodeByHSL() {
	var rand = Math.random();
	// reddish or bluish
	var hue = (++SwitchingColor % 2 == 0) ? rand * 0.2 : 0.5 + rand * 0.2;
	var c = hslToRgb( hue, Math.random() * 0.4 + 0.6, 0.5 );

	return Alpha<<24 | c[0]<<16 | c[1]<<8 | c[2];
}

function getColorCodeByRGB() {
	var red, green, blue;
	var rand = Math.random();

	// even.
	if(++SwitchingColor % 2 == 0) {
		red = 155 + rand * 100;
		blue = rand * 100;
	}
	// odd.
	else {
		blue = 155 + rand * 100;
		red = rand * 100;
	}
	green = 128;
	return Alpha<<24 | red<<16 | green<<8 | blue;
}

function hslToRgb(h, s, l) {
	var r, g, b;

	if(s == 0) {
		r = g = b = l;
	}
	else {
		function hue2rgb(p, q, t) {
			if(t < 0) t += 1;
			if(t > 1) t -= 1;
			if(t < 1/6) return p + (q - p) * 6 * t;
			if(t < 1/2) return q;
			if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		}

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}