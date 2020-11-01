"use strict";

let canvas, frame_interval, frame_timer, move_interval, move_timer;
let ctx;
frame_interval = 16.6;
let game_object, field;
let snake_block_color = "hsl(223, 78%, 59%)";
let block_offset = 0.6;
let opposites = {
    "right" : "left",
    "left" : "right",
    "up" : "down",
    "down" : "up"
};
let eye_radius, vertical_component, horizontal_component;
function shift_array_right_by(arr, amount){
    let new_arr = [];
    for (let i = 0; i < arr.length; i += 1){
        new_arr.push(0);
    }
    for (let i = 0; i < arr.length; i += 1){
        let old_data = arr[i];
        let new_index = i + amount;
        if(new_index < arr.length){
            new_arr[new_index] = old_data;
        }
    }
    return new_arr;


}

class game_field {
    constructor(size_x, size_y) {
        this.block_width = Math.floor(canvas.width / size_x);
        this.block_height = Math.floor(canvas.height / size_y);
        
        this.draw = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw background
            /*
            let even_color = "hsl(80, 63%, 68%)";
            let odd_color = "hsl(81, 60%, 48%)";
            let counter = 0;
            for (let i = 0; i < size_y; i += 1) {
                for (let j = 0; j < size_x; j += 1) {
                    ctx.save();
                    if (counter === 0) {
                        ctx.fillStyle = even_color;
                        counter = 1;
                    } else {
                        ctx.fillStyle = odd_color;
                        counter = 0;
                    }

                    ctx.fillRect(j * this.block_width, i * this.block_height, this.block_width, this.block_height);
                    ctx.restore();
                    
                }
                
                
            }
            */
           let color = "hsl(0, 0%, 5%)";
           for (let i = 0; i < size_y; i += 1) {
                for (let j = 0; j < size_x; j += 1) {
                    ctx.save();
                    ctx.lineWidth = 0.5;
                    ctx.strokeStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(j * field.block_width, i * field.block_height);
                    ctx.lineTo(j * field.block_width + field.block_width, i * field.block_height);
                    ctx.lineTo(j * field.block_width + field.block_width, i * field.block_height + field.block_height);
                    
                    ctx.stroke();
                    
                }
                
                
            }
            this.snake.draw();
        }
        this.initialize = function(){
            this.snake = new snake(7, 7);
            bind_input();
        }
    }
}

class top_info_menu {
    constructor() {

    }
}

class snake {
    constructor(start_x, start_y) {
        this.body = [new snake_block(start_x, start_y), new snake_block(start_x - 1, start_y), new snake_block(start_x - 2, start_y), new snake_block(start_x - 3, start_y), new snake_block(start_x - 4, start_y),  new snake_block(start_x - 5, start_y)];
        this.directions = ["right", "right", "right", "right", "right", "right"];
        this.head_direction = "right";
        
        this.change_direction = function(direction){
            let opposite = opposites[this.head_direction];
            if(opposite != direction){
                this.head_direction = direction;
            }
            
        }
        this.move_in_direction = function(){
            let directions_copy = this.directions;
            let head_direction = this.head_direction;
            let new_directions = shift_array_right_by(directions_copy, 1);
            new_directions[0] = head_direction;
            this.directions = new_directions;
            console.log(this.directions);
            for(let i = 0; i < this.body.length; i += 1){
                this.body[i].move(this.directions[i]);
            }
        }
        this.draw = function(){
            this.body[0].draw(this.directions[0], true);
            for(let i = 1; i < this.body.length; i += 1){
                this.body[i].draw(this.directions[i]);
            }
        }
    }
}

class snake_block {
    constructor(block_x, block_y) {
        console.log(block_x, block_y);
        this.top = block_y * field.block_height;
        this.bottom = this.top + field.block_height;
        this.left = block_x * field.block_width;
        this.right = this.left + field.block_width;
        
        this.move = function(direction){
            switch(direction){
                case "up":
                    this.top -= field.block_height;
                    this.bottom -= field.block_height;
                    break;
                case "down":
                    this.top += field.block_height;
                    this.bottom += field.block_height;
                    break;
                case "left":
                    this.left -= field.block_width;
                    this.right -= field.block_width;
                    break;
                case "right":
                    this.left += field.block_width;
                    this.right += field.block_width;
                    break;
            }
        }
       
        this.draw = function(direction, head = false){
            
            ctx.save();
            ctx.fillStyle = snake_block_color;
            ctx.fillRect(this.left + block_offset, this.top + block_offset, field.block_width - block_offset * 2, field.block_height- block_offset * 2);
            ctx.restore();

            if(head === true){
                if(direction === "up" || direction === "down"){
                    let vertical_center = this.top + vertical_component;
                    let left_eye_x = this.left + Math.round((1/4 * field.block_width));
                    let right_eye_x = this.right - Math.round((1/4 * field.block_width));
                    
                    ctx.save();
                    ctx.fillStyle = "hsl(60, 100%, 50%)";
                    ctx.beginPath();
                    ctx.arc(left_eye_x, vertical_center, eye_radius, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(right_eye_x, vertical_center, eye_radius, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.restore();
                }
                else{
                    let horizontal_center = this.left + horizontal_component;
                    let left_eye_y = this.top + Math.round((1/4 * field.block_height));
                    let right_eye_y = this.bottom - Math.round((1/4 * field.block_height));
                    
                    ctx.save();
                    ctx.fillStyle = "hsl(60, 100%, 50%)";
                    ctx.beginPath();
                    ctx.arc(horizontal_center, left_eye_y, eye_radius, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(horizontal_center,right_eye_y, eye_radius, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.restore();
                }
            }
            
        }
    }
}

function bind_input(){
    document.addEventListener("keydown", function(ev){
        let key = ev.key;
        let direction;
        if(key === "a"){
            direction = "left";
        }
        else if(key === "w"){
            direction = "up";
        }
        else if(key === "d"){
            direction = "right";
        }
        else if(key === "s"){
            direction = "down";
        }
        field.snake.change_direction(direction);
    })
}

// process_frame has to be in a global scope, otherwise it does not work
function process_frame(){
    
    field.draw();
}


function move_snake(){
    field.snake.move_in_direction();
}


// initializes everything, such as game_object and frame timer
function init(difficulty) {
    canvas = document.querySelector("#main_canvas");
    ctx = canvas.getContext("2d");
    
    
    // easy = 200; medium = 175; hard = 120;
    switch (difficulty) {
        case "easy":
            move_interval = 200;
            break;
        case "medium":
            move_interval = 175;
            break;
        case "hard":
            move_interval = 120;
            break;
        default:
            move_interval = 175;
            break;
    }
    
    field = new game_field(15, 15);
    field.initialize();
    eye_radius = Math.round((1/8 * field.block_width));
    vertical_component = Math.round(field.block_height / 2);
    horizontal_component = Math.round(field.block_width / 2);
    frame_timer = setInterval(process_frame, frame_interval);
    move_interval = setInterval(move_snake, move_interval);
}

// event listener to call init() function
document.addEventListener("DOMContentLoaded", ev => {
    init("medium");
});