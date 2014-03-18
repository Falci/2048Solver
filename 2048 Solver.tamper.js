// ==UserScript==
// @name       2048 Solver
// @namespace  http://falci.me
// @version    0.1
// @description 
// @match      http://gabrielecirulli.github.io/2048/
// @copyright  2014+, Fernando Falci <falci@falci.me>
// ==/UserScript==

var Key = {
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	LEFT: 37
};

var KeyName = {
	38: "up",
	39: "right",
	40: "down",
	37: "left"
};

var Solver = {
	leftCount: 0,
	move: function(){	
		var next = this.nextMove( this.bestMove() );
		
		sendKey( next );
		if(next === Key.LEFT){
			if(this.leftCount++ > 10){
				this.leftCount = 0;
				document.querySelector(".retry-button").click();
			}
			
			sendKey(Key.RIGHT);
		}
	},
	nextMove: function(dir){	
		if( this.canMoveTo(dir) ) return dir;
		
		if( dir === Key.UP){
			if( !this.canMoveTo(Key.RIGHT) ){
				if( !this.canMoveTo(Key.DOWN) ){
					return Key.LEFT;
				}			
				return Key.DOWN;
			}
			return Key.RIGHT;
		}
		
		return this.nextMove(Key.UP);
	},

	canMoveTo: function(direction){
		if(direction === Key.UP) return this.canMoveUp();
		if(direction === Key.RIGHT) return this.canMoveRight();
		if(direction === Key.DOWN) return this.canMoveDown();
		
		return this.canMoveLeft();
	},
	
	canMoveUp: function(downRight){
		downRight = downRight || false;
		
		for(var x=1; x<=4; x++){
			if( this.canMoveUpColumn(x, downRight) )
				return true;
		}
		return false;
	},
	canMoveUpColumn: function(x, downRight){
		var tiles = [];
		for(var y=1; y<=4; y++){
			tiles.push(this.get(x, y));
		}
		
		return this.canMoveTilesArray(tiles, downRight);
	},
	canMoveDown: function(){
		return this.canMoveUp(true);
	},
	
	canMoveRight: function(downRight){
		downRight = downRight || true;
		
		for(var y=1; y<=4; y++){
			if( this.canMoveRigthRow(y, downRight) )
				return true;
		}
		return false;
	},
	canMoveRigthRow: function(y, downRight){
		var tiles = [];
		for(var x=1; x<=4; x++){
			tiles.push(this.get(x, y));
		}
		
		return this.canMoveTilesArray(tiles, downRight);
	},
	canMoveLeft: function(){
		return this.canMoveUp(false);
	},
	
	canMoveTilesArray: function(tiles, downRight){
		var start = downRight ? 0 : 1;
		var next = downRight ? function(i){ return tiles[i+1] } : function(i){ return tiles[i-1] }
		
		for(var i=start; i<start+3; i++){
			if(tiles[i] && (tiles[i] === next(i) || !next(i)) )
				return true;
		}
		
		
		
		return false;
	},
	lastZeroUpDown: false,
	bestMove: function(){
		var toUp = this.maxTileMovingUp();
		var toRight = this.maxTileMovingRight();
		
		var max = Math.max(toUp, toRight);		
		//if(!max) return Math.round(Math.random()) ? Key.UP : Key.DOWN;
		
		if( !max ){
			this.lastZeroUpDown = !this.lastZeroUpDown;
		} 
		
		if( max == 1024){
			
			clearInterval(timer);
			timer = false;
			
			alert("2048!")
		}
		
		if( max && toUp === toRight ){
			return Key.RIGHT;
		
		}
		
		if( max === toUp ){
			return this.lastZeroUpDown ? Key.UP : Key.DOWN;
		}
		
		
		return Key.RIGHT;
	},

    maxTileMovingUp: function(){
		var max = 0;
        for(var x=1; x<=4; x++){
            for(var y=2; y<=4; y++){ // start on #2 line
                var thisTile = this.get(x,y);
                var topTile = this.get(x, y-1);
                
                if( thisTile && thisTile === topTile ){
                    //max = Math.max(max, thisTile);
					max++;
                }
            }
        }
		return max;
    },
    maxTileMovingRight: function(){
		var max = 0;
        for(var x=2; x<=4; x++){// start on #2 column
            for(var y=1; y<=4; y++){ 
                var thisTile = this.get(x,y);
                var topTile = this.get(x-1, y);
                
                if( thisTile && thisTile === topTile ){
                    //max = Math.max(max, thisTile);
					max++;
                }
            }
        }
		return max;
    },
    
    get: function(x, y){
       	var tiles = document.querySelectorAll(".tile-position-"+x+"-"+y);
        if( tiles.length === 0 ){
         	return 0;   
        }
        
        if( tiles.length === 1 ){
         	return nodeToInt( tiles.item(0) );
        }
        
        return nodeToInt( document.querySelector(".tile-merged.tile-position-"+x+"-"+y) );
    }
};

function nodeToInt(node){
    return parseInt( node.innerText.trim() );
}

function sendKey(k){
    var oEvent = document.createEvent('KeyboardEvent');

    // Chromium Hack
    Object.defineProperty(oEvent, 'keyCode', {
                get : function() {
                    return this.keyCodeVal;
                }
    });     
    Object.defineProperty(oEvent, 'which', {
                get : function() {
                    return this.keyCodeVal;
                }
    });     

    if (oEvent.initKeyboardEvent) {
        oEvent.initKeyboardEvent("keydown", true, true, document.defaultView, k, k, false, false, false, false);
    } else {
        oEvent.initKeyEvent("keydown", true, true, document.defaultView, false, false, false, false, k, 0);
    }

	oEvent.metaKey = false;
	oEvent.shiftKey = false;
    oEvent.keyCodeVal = k;

    if (oEvent.keyCode !== k) {
        alert("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
    }

    document.dispatchEvent(oEvent);
}
var timer = false;
window.addEventListener('load', function(){
	var button = document.createElement("button");
	button.textContent = "Move";
	
	button.addEventListener('click', function(){
		if(!timer){
			timer = setInterval(function(){
				Solver.move();
			}, '100');
		} else {
			clearInterval(timer);
			timer = false;
		}
	});
	
	document.querySelector(".game-intro").appendChild(button);
});