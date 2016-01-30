/**
 * Module exports.
 */

module.exports = Player;


function Player(game, name, index, identity) {
    this.game = game;
    this.name = name;
    this.index = index;
    this.identity = identity;
}