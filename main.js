"use strict";

let canvas;
let ctx;
let game_object;
class game_field{
    constructor(size_x, size_y){
        this.block_width = Math.floor(canvas.width / size_x);
        this.block_height = Math.floor(canvas.height / size_y);
        this.draw = function(){
            
        }
    }
}

class top_info_menu{
    constructor(){

    }
}

class snake{
    constructor(){

    }
}

class snake_block{
    constructor(){

    }
}

// easy = 300; medium = 200; hard = 150;
class game{
    constructor(difficulty){
        
        this.field = new game_field(18, 15);
        this.frame_interval;
        this.frame_timer;
        this.process_frame = function(){

        }
        switch(difficulty){
            case "easy":
                this.frame_interval = 300;
                break;
            case "medium":
                this.frame_interval = 200;
                break;
            case "hard":
                this.frame_interval = 150;
                break;
            default:
                this.frame_interval = 200;
                break;
        }
        this.frame_timer = setInterval(this.process_frame, this.frame_interval);
        
    }
}
function init(){
    canvas = document.querySelector("#main_canvas");
    ctx = canvas.getContext("2d");
    game_object = new game("medium");
}
document.addEventListener("DOMContentLoaded", ev => {init()});
