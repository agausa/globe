
var gDayImage = new Image();
var gDisplayWidth = 500;
var gDisplayHeight = 500;

var CW = gDisplayWidth/2;
var CH = gDisplayHeight/2;

var gRadius = 250;
var gAngX = 0;
var gAngY = 0;

var gDayImageName = "images/world_4096x2048.png";

var PI = 3.141592653589793238;
var PI_2 = 6.283185307179586476;
var RANGE = 65536;

var sqrt_table = new Array();
var cos_b1 = new Array();

//________________________________ GenerateLookupTables _______________________

function GenerateLookupTables(){
	var w = gDisplayWidth/2;
	for(var x =- w; x <= w; x++)
	{
		if(Math.abs(x) > gRadius)
		{
			sqrt_table[x + w] = 0.0;
			cos_b1[x + w] = 0.0;
		}
		else
		{
			sqrt_table[x + w] = Math.sqrt(gRadius*gRadius - x*x);
			var b1 = Math.asin(x/gRadius);
			cos_b1[x + w] = Math.cos(b1);
		}
	}
}

//________________________________ drawGlobe __________________________________

function drawGlobeTest(ctx, data){
  /*
  ctx.strokeRect(50, 50, 100, 100);

  ctx.font = "bold 36px impact";
  ctx.fillStyle = 'white';
  ctx.fillText("CANVAS MEMES!", c.width/2, 40);

  ctx.lineWidth = 3;
  ctx.strokeStyle = 'black';
  ctx.strokeText("CANVAS MEMES!", c.width/2, 40);
  */

  var imageData = ctx.getImageData(0, 0, gDisplayWidth, gDisplayHeight);
  var imageSize = imageData.data.length / 4;

  for(var i = 0; i < imageSize; i += 1)
  {
    imageData.data[i*4 + 0] = data[i*4 + 0];
    imageData.data[i*4 + 1] = data[i*4 + 1];
    imageData.data[i*4 + 2] = data[i*4 + 2];
    imageData.data[i*4 + 3] = data[i*4 + 3];
  }

  ctx.putImageData(imageData, 0, 0);
};

//________________________________ loadMapImage _______________________________

function loadMapImage(ctx){
  gDayImage.src = gDayImageName;

  gDayImage.onload = function() {

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = gDayImage.width;
    canvas.height = gDayImage.height;
    context.drawImage(gDayImage, 0, 0 );
    var data = context.getImageData(0, 0, gDayImage.width, gDayImage.height).data;

    drawGlobe(ctx, data);
  }
};

//________________________________ drawGlobe __________________________________

function drawGlobe(ctx, data){
  var imageData = ctx.getImageData(0, 0, gDisplayWidth, gDisplayHeight);
  var bmpW = gDayImage.width;
	var bmpH = gDayImage.height;

  var bmpW_1 = bmpW - 1;

  // set radius
  var r = gRadius;
  if(gRadius >= CW) r = CW - 1;

  // get rotation points
  var aX = gAngX*2*PI/RANGE;
  var aY = gAngY*2*PI/RANGE;

  var bmpCPX = (aX * (bmpW_1)/PI_2) + bmpW/4;
	if(bmpCPX >= bmpW)
		bmpCPX -= bmpW;

  // draw from left to right
  for(var x = -r + 1; x <= 0; x++){

    var r2y2 = sqrt_table[x + CW];
		var yLimit = Math.round(r2y2);
		if(yLimit >= CH) yLimit = CH - 1;
		if(x == 0) yLimit--;

    var cosb1 = cos_b1[x + CW];
		var yoff = (-yLimit + CH) * gDisplayWidth + CW;		//the CW is actually the x offset but is
                						                          //added here for speed

    for(var y = -yLimit; y <= yLimit; y++){

      //get angles in SCS with x polar axis
      var a1 = Math.asin(y/r2y2) + aY;

      var y1 = Math.sin(a1)*cosb1;
      var z1 = Math.cos(a1)*cosb1;

      //convert to SCS with y polar axis
			var b2 = Math.asin(y1);
			var a2 = Math.asin(z1/Math.cos(b2));
			if(x < 0)
				a2 = PI - a2;
			a2 += aX;

      if(a2 >= PI_2) a2 -= PI_2;
      if(a2 < 0) a2 += PI_2;

      var bmpX = Math.round((a2 * bmpW_1 / PI_2));
			var bmpY = Math.round(((PI/2 + b2) * bmpW_1 )/ PI_2);

      imageData.data[(yoff - x)*4 + 0] = data[(bmpY*bmpW + bmpX)*4 + 0];
      imageData.data[(yoff - x)*4 + 1] = data[(bmpY*bmpW + bmpX)*4 + 1];
      imageData.data[(yoff - x)*4 + 2] = data[(bmpY*bmpW + bmpX)*4 + 2];
      imageData.data[(yoff - x)*4 + 3] = data[(bmpY*bmpW + bmpX)*4 + 3];

      // draw second half - we don't need any calculations
      if(x){
        bmpX = bmpCPX*2 - bmpX;
				if(bmpX < 0)
					bmpX += bmpW;
				else if(bmpX >= bmpW)
					bmpX -= bmpW;

          imageData.data[(yoff + x)*4 + 0] = data[(bmpY*bmpW + bmpX)*4 + 0];
          imageData.data[(yoff + x)*4 + 1] = data[(bmpY*bmpW + bmpX)*4 + 1];
          imageData.data[(yoff + x)*4 + 2] = data[(bmpY*bmpW + bmpX)*4 + 2];
          imageData.data[(yoff + x)*4 + 3] = data[(bmpY*bmpW + bmpX)*4 + 3];

      }
      yoff += gDisplayWidth;
    }
  }

  ctx.putImageData(imageData, 0, 0);
};

//________________________________ rotateToLatLon _____________________________

function rotateToLatLon(lat, lon)
{
	//lat/lon values are in radians
	//lat is in range -PI/2 to PI/2
	//lon is in range 0 to 2*PI
	gAngY =  Math.round(-lat*RANGE/PI_2);
	gAngX =  Math.round((lon+PI/2)*RANGE/PI_2);
	if(gAngX < 0) gAngX += RANGE;
	else if(gAngX > RANGE) gAngX -= RANGE;
}
