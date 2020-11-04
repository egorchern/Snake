"use strict";

let canvas, frame_interval, move_interval, move_timer;
let ctx;
let game_object, field;
let snake_block_color = "hsl(223, 78%, 59%)";
let block_offset = 0.4;
let opposites = {
    "right": "left",
    "left": "right",
    "up": "down",
    "down": "up"
};
let frame_counter = 0;
let eye_radius, vertical_component, horizontal_component;

function shift_array_right_by(arr, amount) {
    let new_arr = [];
    for (let i = 0; i < arr.length; i += 1) {
        new_arr.push(0);
    }
    for (let i = 0; i < arr.length; i += 1) {
        let old_data = arr[i];
        let new_index = i + amount;
        if (new_index < arr.length) {
            new_arr[new_index] = old_data;
        }
    }
    return new_arr;


}

//gives random integer between min(inclusive) and max(inclusive)
function get_random_int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class game_field {
    constructor(size_x, size_y) {
        this.size_x = size_x;
        this.size_y = size_y;
        
        this.block_width = Math.floor(canvas.width / size_x);
        this.block_height = Math.floor(canvas.height / size_y);
        
        this.occupied_squares = [];
        this.fruit_position = [];
        this.snake_collides_with_itself = function(){
            let head_coordinates = this.occupied_squares[0];
            for(let i = 1; i < this.occupied_squares.length; i += 1){
                let part_coordinates = this.occupied_squares[i];
                if(head_coordinates[0] === part_coordinates[0] && head_coordinates[1] === part_coordinates[1]){
                    return true;
                }
            }
            return false;
        }
        this.snake_collides_with_fruit = function(){
            if(this.occupied_squares[0][0] === this.fruit_position[0] && this.occupied_squares[0][1] === this.fruit_position[1]){
                return true;
            }
            else{
                return false;
            }
        }

        this.snake_out_of_bounds = function(){
            
            let current_block = this.occupied_squares[0];
            if(current_block[0] < 0 || current_block[0] >= this.size_x || current_block[1] < 0 || current_block[1] >= this.size_y){
                return true;
            }
            else{
                return false;
            }
        }
        this.stop_game = function(){
            clearInterval(move_timer);
            console.log("game over");
        }
        this.update_occupied_squares = function () {
            let occupied_squares = [];
            for (let i = 0; i < this.snake.body.length; i += 1) {
                let current_snake_block = this.snake.body[i];
                let position_x = Math.round((current_snake_block.left / this.block_width));
                let position_y = Math.round((current_snake_block.top / this.block_height));
                occupied_squares.push([position_x, position_y]);
            }
            this.occupied_squares = occupied_squares;
        }

        this.generate_fruit_position = function () {
            let pair_found;
            let x, y;
            do {
                pair_found = true;
                x = get_random_int(0, this.size_x - 1);
                y = get_random_int(0, this.size_y - 1);
                for(let i = 0; i < this.occupied_squares.length; i += 1){
                    let occupied_x = this.occupied_squares[i][0];
                    let occupied_y = this.occupied_squares[i][1];
                    if (x === occupied_x && y === occupied_y){
                        pair_found = false;
                        break;
                    }
                }
            } while (pair_found === false)
            this.fruit_position = [x, y];
            
        }
        this.draw_fruit = function(){
            let radius = Math.round(this.block_width * 0.28);
            let stick_length = Math.round(this.block_height * 0.2);
            let x_center = this.fruit_position[0] * this.block_width + horizontal_component;
            let y_center = this.fruit_position[1] * this.block_height + vertical_component + 0.5 * stick_length;
            ctx.save();
            ctx.fillStyle = "hsl(120, 60%, 35%)";
            ctx.beginPath();
            ctx.arc(x_center, y_center, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.moveTo(x_center, y_center - radius);
            ctx.lineTo(x_center + 3, y_center - radius - stick_length);
            ctx.stroke();
        }
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
                    ctx.restore();
                }


            }
            
            this.snake.draw();
            this.draw_fruit();
        }
        this.initialize = function () {
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
        this.body = [new snake_block(start_x, start_y)];
        this.directions = ["right"];
        this.head_direction = "right";
        
        this.grow_snake = function () {
            let x, y;
            let last_part = this.body[this.body.length - 1];
            let last_direction = this.directions[this.directions.length - 1];
            x = Math.round(last_part.left / field.block_width);
            y = Math.round(last_part.top / field.block_height);
            if (last_direction === "left") {
                this.body.push(new snake_block(x + 1, y));
            } else if (last_direction === "right") {
                this.body.push(new snake_block(x - 1, y));
            } else if (last_direction === "up") {
                this.body.push(new snake_block(x, y + 1));
            } else {
                this.body.push(new snake_block(x, y - 1));
            }
            this.directions.push(last_direction);
        }

        this.change_direction = function (direction) {
            let opposite = opposites[this.head_direction];
            if (opposite != direction) {
                this.head_direction = direction;
            }

        }
        this.move_in_direction = function () {
            let directions_copy = this.directions;
            let head_direction = this.head_direction;
            let new_directions = shift_array_right_by(directions_copy, 1);
            new_directions[0] = head_direction;
            this.directions = new_directions;

            for (let i = 0; i < this.body.length; i += 1) {
                this.body[i].move(this.directions[i]);
            }
            field.update_occupied_squares();
            let collides_with_fruit = field.snake_collides_with_fruit();
            if(collides_with_fruit === true){
                field.generate_fruit_position();
                this.grow_snake();
            }
            let out_of_bounds = field.snake_out_of_bounds();
            let snake_collided = field.snake_collides_with_itself();
            if(out_of_bounds === true || snake_collided === true){
                field.stop_game();
            }

        }
        this.draw = function () {
            this.body[0].draw(this.directions[0], true);
            for (let i = 1; i < this.body.length; i += 1) {
                this.body[i].draw(this.directions[i]);
            }
        }
    }
}

class snake_block {
    constructor(block_x, block_y) {

        this.top = block_y * field.block_height;
        this.bottom = this.top + field.block_height;
        this.left = block_x * field.block_width;
        this.right = this.left + field.block_width;

        this.move = function (direction) {
            switch (direction) {
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

        this.draw = function (direction, head = false) {

            ctx.save();
            ctx.fillStyle = snake_block_color;
            ctx.fillRect(this.left + block_offset, this.top + block_offset, field.block_width - block_offset * 2, field.block_height - block_offset * 2);
            ctx.restore();

            if (head === true) {
                if (direction === "up" || direction === "down") {
                    let vertical_center = this.top + vertical_component;
                    let left_eye_x = this.left + Math.round((1 / 4 * field.block_width));
                    let right_eye_x = this.right - Math.round((1 / 4 * field.block_width));

                    ctx.save();
                    ctx.fillStyle = "hsl(60, 100%, 50%)";
                    ctx.beginPath();
                    ctx.arc(left_eye_x, vertical_center, eye_radius, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(right_eye_x, vertical_center, eye_radius, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.restore();
                } else {
                    let horizontal_center = this.left + horizontal_component;
                    let left_eye_y = this.top + Math.round((1 / 4 * field.block_height));
                    let right_eye_y = this.bottom - Math.round((1 / 4 * field.block_height));

                    ctx.save();
                    ctx.fillStyle = "hsl(60, 100%, 50%)";
                    ctx.beginPath();
                    ctx.arc(horizontal_center, left_eye_y, eye_radius, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(horizontal_center, right_eye_y, eye_radius, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.restore();
                }
            }

        }
    }
}

function bind_input() {
    document.addEventListener("keydown", function (ev) {
        let key = ev.key;
        let direction;
        if (key === "a") {
            direction = "left";
        } else if (key === "w") {
            direction = "up";
        } else if (key === "d") {
            direction = "right";
        } else if (key === "s") {
            direction = "down";
        }
        field.snake.change_direction(direction);
    })
}




//move in direction and draw 
function move_snake() {
    field.snake.move_in_direction();
    field.draw();
}


// initializes everything, such as game_object and frame timer
function init(difficulty) {
    canvas = document.querySelector("#main_canvas");
    ctx = canvas.getContext("2d");


    // easy = 225; medium = 195; hard = 175;
    switch (difficulty) {
        case "easy":
            move_interval = 225;
            break;
        case "medium":
            move_interval = 195;
            break;
        case "hard":
            move_interval = 175;
            break;
        default:
            move_interval = 195;
            break;
    }

    field = new game_field(15, 15);
    field.initialize();
    eye_radius = Math.round((1 / 8 * field.block_width));
    vertical_component = Math.round(field.block_height / 2);
    horizontal_component = Math.round(field.block_width / 2);
    
    move_timer = setInterval(move_snake, move_interval);
    field.generate_fruit_position();
}

// event listener to call init() function
document.addEventListener("DOMContentLoaded", ev => {
    init("medium");
});