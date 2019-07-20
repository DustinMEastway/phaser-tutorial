import { AUTO, Types } from 'phaser';

type GameConfig = Types.Core.GameConfig;

export const gameConfig: GameConfig = {
	type: AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 300 },
			debug: false
		}
	}
};
