
/**
 * Module dependencies.
 */
var Emitter = require('events').EventEmitter;
var player = require('./player.js');

/**
 * Module exports.
 */

module.exports = Game;

/**
 * Blacklisted events.
 *
 * @api public
 */

exports.events = [
    'error',
    'connect',
    'disconnect',
    'newListener',
    'removeListener'
];

/**
 * `EventEmitter#emit` reference.
 */

var emit = Emitter.prototype.emit;

function Game(state) {
    
    var MAX_TURNS = 5
    var MAX_TRIES = 5
    var NUM_WINS = 3
    var NUM_LOSSES = 3

    this.state = state || State()
    this.partcipants = [2, 3, 2, 3, 3]
    
    Game.prototype.run = function(){
        
    };
    
    Game.prototype.win = function () {
        return this.state.wins >= NUM_WINS;
    };
    
    Game.prototype.lose = function () {
        return this.state.losses >= NUM_LOSSES;
    };

    Game.prototype.done = function () {
        if (this.state.tries > MAX_TRIES) {
            return true;
        }
        
        if (this.state.turn > MAX_TURNS) {
            return true;
        }
        
        return this.win() || this.lose();
    };
    
    Game.prototype.next_leader = function () {
        var i
        if (this.state.leader) {
            i = ((this.state.leader.index + 1) % this.state.players.length)
        } else {
            i = 0
        }

        return this.state.players[i];
    }

    Game.prototype.performSelection = function () {
        this.state.team = [];
        this.state.votes = [];
        this.state.sabotages = [];

        // 
        var count = this.partcipants[this.state.turn - 1];
        
        var selected = this.getSelection(count);

    }
    // TODO:: MORE functions
}

function State() {

    var PHASE_PREPARING = 0
    var PHASE_SELECTION = 1
    var PHASE_VOTE = 2
    var PHASE_MISSION = 3
    var PHASE_ANNOUNING = 4

    this.phase = 0
    this.turn = 1
    this.tries = 1
    this.wins = 0
    this.losses = 0
    this.leader = null
    this.team = null
    this.players = [];
    this.votes = [];
    this.sabotages = null
}