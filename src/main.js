import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import {ResourceLoader} from './scenes/ResourceLoader';
import {Quiz} from './scenes/Quiz';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 896,
    height: 448,
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics:{
        default:'matter',
        matter:{
            gravity:{
                y:0.8
            },
            debug:true
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
    ResourceLoader,
        Boot,
        Preloader,
        MainMenu,
        Game,
        GameOver,
        Quiz
    ]
};

export default new Phaser.Game(config);
