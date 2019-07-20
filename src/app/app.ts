import { Game } from 'phaser';

import { gameConfig } from './game-config';
import { GameScene } from './game-scene';

export function start(): void {
	gameConfig.scene = new GameScene('scene');

	new Game(gameConfig);
}
