import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        const {width,height} = this.scale;
        console.log(width,height)
        // this.cameras.main.setBackgroundColor(0xff0000);

        const backgroundImage = this.add.image(0, 0, 'background').setAlpha(0.5).setOrigin(0, 0);
        backgroundImage.setScale(2, 0.8);

        this.add.text(
            width/2.0, 
            height/2.0, 
            'Game Over', 
            {
            fontFamily: 'Arial Black', 
            fontSize: 64, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(
            width/2.0, 
            height/2.0+70, 
            '点击鼠标重新开始', 
            {
            fontFamily: 'Arial Black', 
            fontSize: 32, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('Boot');

        });
    }
}
