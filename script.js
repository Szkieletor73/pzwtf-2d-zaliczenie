// Create a rectangle with an (x, y) coordinate, a width, and a height
function rect(x, y, w, h) {
  return { x: x, y: y, w: w, h: h }
}

// Config
var tileHeight = 32;
var tileWidth = 32;

// Set tile types for level generator
var solid = "#";
var lava = "l";
var playerSpawn = "p";
var coin = "o";

// Example map array
var map = [
  ["#", "#", "#", "#", "#", "#", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  ["#", "#", "#", "#", "#", "#", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "o", " ", " "],
  ["#", "#", "#", "#", "#", "#", "#", " ", " ", " ", " ", " ", " ", " ", "o", " ", " ", " ", "#", " ", "#", " ", " ", "#", "o", " "],
  ["#", " ", "#", "#", "#", "#", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  ["#", " ", "#", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", " ", "#", "l", "#"],
  ["#", " ", "#", " ", " ", " ", " ", " ", " ", " ", "o", " ", " ", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#", "#", "#"],
  ["#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "o", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  ["#", " ", " ", " ", "o", " ", " ", " ", " ", " ", " ", "#", " ", " ", "#", "#", "#", "l", "#", "#", " ", " ", " ", " ", " ", " "],
  ["#", " ", " ", " ", "#", " ", " ", " ", "o", " ", " ", " ", " ", " ", " ", " ", "#", "l", "l", "#", "#", "#", " ", " ", " ", " "],
  ["#", " ", " ", " ", " ", " ", " ", " ", "#", "#", " ", " ", " ", " ", " ", " ", "#", "#", "#", "#", "#", "#", "#", " ", " ", "o"],
  ["#", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#"],
  ["#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  ["#", "#", " ", " ", " ", "p", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "o", " ", " ", " ", " ", " ", "#", "l"],
  ["#", "#", " ", " ", " ", "#", " ", "o", " ", "o", " ", "o", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#", "#"],
  ["l", "l", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "l", "#", "#", " ", " ", " ", " ", " ", " ", " ", " ", "#", "l", "#"],
  ["l", "l", "l", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "l", "l", "l", "#", "l", "l", "l", "#", "#", "l", "#"]
]

// Set initial coordinates and array
var platforms = [];
var lavaTiles = [];
var coins = [];
var cx = 0;
var cy = 0;
var player = rect(0, 0, 28, 28);
var score = 0;

function loadLevel(level){
  cx = 0;
  cy = 0;
  platforms = [];
  lavaTiles = [];
  coins = [];
  enemies = [];
  score = 0;

  for (let line of level) { // for each line of the level array...
    cx = 0; // reset X coordinate at start of new line
    for (let tile of line) { // and now for each tile of every line.
      switch (tile) {
        case solid:
          platforms.push(rect(cx * tileWidth, cy * tileHeight, 32, 32));
          break;

        case playerSpawn:
          player.x = cx * tileWidth + 2;
          player.y = cy * tileHeight + 2;
          break;

        case lava:
          lavaTiles.push(rect(cx * tileWidth, cy * tileHeight + 1, 32, 32));
          break;

        case coin:
          coins.push(rect(cx * tileWidth + 8, cy * tileHeight + 8, 16, 16));
          break;
      }

      cx += 1; // bump the X coordinate by 1
    }
    cy += 1; // bump the Y coordinate by 1
  }
}

// Returns true if a and b overlap
function hitTest(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y
}

// Move the rectangle p along vx then along vy, but only move
// as far as we can without colliding with a solid rectangle
function move(p, vx, vy) {
  // Move rectangle along x axis
  for (var i = 0; i < platforms.length; i++) {
    var c = { x: p.x + vx, y: p.y, w: p.w, h: p.h }
    if (hitTest(c, platforms[i])) {
      if (vx < 0) vx = platforms[i].x + platforms[i].w - p.x
      else if (vx > 0) vx = platforms[i].x - p.x - p.w
    }
  }
  p.x += vx

  // Move rectangle along y axis
  for (var i = 0; i < platforms.length; i++) {
    var c = { x: p.x, y: p.y + vy, w: p.w, h: p.h }
    if (hitTest(c, platforms[i])) {
      if (vy < 0) vy = platforms[i].y + platforms[i].h - p.y
      else if (vy > 0) vy = platforms[i].y - p.y - p.h
    }
  }
  p.y += vy
}

// Record which key codes are currently pressed
var keys = {}
document.onkeydown = function(e) { keys[e.which] = true }
document.onkeyup = function(e) { keys[e.which] = false }

// Player is a rectangle with extra properties
//var player = rect(20, 20, 20, 20)
player.velocity = { x: 0, y: 0 }
player.onFloor = false

// Updates the state of the game for the next frame
function update() {
  // Update the velocity
  player.velocity.x = 3 * (!!keys[39] - !!keys[37]) // right - left
  player.velocity.y += 1 // Acceleration due to gravity

  // Move the player and detect collisions
  var expectedY = player.y + player.velocity.y
  move(player, player.velocity.x, player.velocity.y)
  player.onFloor = (expectedY > player.y)
  if (expectedY != player.y) player.velocity.y = 0

  // Only jump when we're on the floor
  if (player.onFloor && keys[38]) {
    player.velocity.y = -13
  }

  // Check lava collision
  for (var i = 0; i < lavaTiles.length; i++) {
    if (hitTest(player, lavaTiles[i])) {
      loadLevel(map);
    }
  }

  // Check coin collision
  for (var i = 0; i < coins.length; i++) {
    if (hitTest(player, coins[i])) {
      score += 1;
      coins.splice(i, 1);
    }
  }
}

// Renders a frame
function draw() {
  var ctx = document.getElementById('screen').getContext('2d')

  // Draw background
  ctx.fillStyle = '#2b2b2b'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Draw player
  ctx.fillStyle = '#06f'
  ctx.fillRect(player.x, player.y, player.w, player.h)

  // Draw levels
  ctx.fillStyle = '#BBB'
  for (var i = 0; i < platforms.length; i++) {
    var r = platforms[i]
    ctx.fillRect(r.x, r.y, r.w, r.h)
  }

  // Draw lava
  ctx.fillStyle = '#f60'
  for (var i = 0; i < lavaTiles.length; i++) {
    var r = lavaTiles[i]
    ctx.fillRect(r.x, r.y, r.w, r.h)
  }

  // Draw coins
  ctx.fillStyle = '#ff0'
  for (var i = 0; i < coins.length; i++) {
    var r = coins[i]
    ctx.fillRect(r.x, r.y, r.w, r.h)
  }

  // Draw GUI
  ctx.fillStyle = '#ff0'
  ctx.fillRect(10, 16, 16, 16)
  ctx.fillStyle = '#eee'
  ctx.font = '24px Arial'
  ctx.fillText("x " + score,32,32)
}

// Set up the game loop
window.onload = function() {
  loadLevel(map);
  setInterval(function() {
    update()
    draw()
  }, 1000 / 60)
}