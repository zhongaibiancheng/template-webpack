import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.image('background', 'assets/images/background.png');
        this.load.image("spike", "assets/images/spike.png");
        this.load.atlas('player', 'assets/images/kenney_player.png', 'assets/images/kenney_player_atlas.json');
        this.load.image('tiles', 'assets/tilesets/platformPack_tilesheet.png');
        // Load the export Tiled JSON
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/level1.json');

    }

    _addKeys() {
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    create() {
        this._addKeys();
        const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
        backgroundImage.setScale(2, 0.8);

        const coinText = this.add.text(10,10,'金币:0',{ fontFamily: 'Arial', fontSize: 14, color: '#00ff00' });
        
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('kenney_simple_platformer', 'tiles');
        // 创建静态图层
        const platforms = map.createLayer('Platforms', tileset, 0, 0);
        // 设置碰撞属性
        platforms.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(platforms, { label: 'floor' });

        const coins = map.createLayer("Coins", tileset, 0, 0);
        coins.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(coins, { label: 'coin' });

        this.matter.world.setBounds();

        // 为玩家角色添加传感器来检测是否在地面上
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;

        this.player = this.matter.add.sprite(50, 0, 'player', null, {});
        this.player.setRectangle(64, 90);

        this.player.setBounce(0.2);

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('player', {
                prefix: 'robo_player_',
                start: 2,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 'robo_player_0' }],
            frameRate: 10,
        });
        this.anims.create({
            key: 'jump',
            frames: [{ key: 'player', frame: 'robo_player_1' }],
            frameRate: 10,
        });

        this.player.setFixedRotation();

        this.player.body.label = "player";

        this.player.isOnGround = true;

        this.player.setFrictionAir(0.01);

        const objectsGroup = this.add.group();
        // 获取对象层
        const objectsLayer = map.getObjectLayer('Spikes');
        if (objectsLayer) {
            objectsLayer.objects.forEach(object => {
                const { x, y, width, height } = object;

                // 创建一个 Matter.js 物体
                const matterObject = this.matter.add.rectangle(x + width / 2, y - height / 2, width, height, { isStatic: true });
                matterObject.label = "spike";

                // 创建一个对应的游戏对象（sprite 或 image）并添加到 Group 中
                const gameObject = this.add.image(x + width / 2, y - height / 2, 'spike');
                objectsGroup.add(gameObject);
                gameObject.setData('matterBody', matterObject); // 将 Matter.js 物体关联到游戏对象
            });
        } else {
            console.error('ObjectsLayer not found in tilemap');
        }

        let coin_count =0;
        // 监听碰撞事件
        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
            const pairs = event.pairs;

            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];

                if (pair.bodyA.label === "player" || pair.bodyB.label === "player") {
                    const target = pair.bodyA.label === 'player' ? pair.bodyB.label : pair.bodyA.label;
                    const target_body = pair.bodyA.label === 'player' ? pair.bodyB : pair.bodyA;

                    if (target === 'floor') {
                        this.player.isOnGround = true;
                    } else {
                        this.player.isOnGround = false;
                        if (target === 'spike') {
                            this.playerHit(this.player, target);
                        } else if (target === 'coin') {
                            const tileWrapper = target_body.gameObject;
                            const tile = tileWrapper.tile;

                            // Only destroy a tile once
                            if (tile.properties.isBeingDestroyed) {
                                continue;
                            }
                            tile.properties.isBeingDestroyed = true;

                            // Since we are using ES5 here, the local tile variable isn't scoped to this block -
                            // bind to the rescue.
                            this.tweens.add({
                                targets: tile,
                                alpha: { value: 0, duration: 100, ease: 'Power1' },
                                onComplete: this.destroyTile.bind(this, tile)
                            });
                            coin_count++;

                            coinText.setText("金币:"+coin_count);
                        }
                    }
                }
            }


        });
    }
    destroyTile(tile) {
        const layer = tile.tilemapLayer;
        layer.removeTileAt(tile.x, tile.y);
        tile.physics.matterBody.destroy();
    }

    playerHit(player, spike) {
        // Set velocity back to 0
        player.setVelocity(0, 0);
        // Put the player back in its original position
        player.setX(50);
        player.setY(0);
        // Use the default `idle` animation
        player.play('idle', true);
        // Set the visibility to 0 i.e. hide the player
        player.setAlpha(0);
        // Add a tween that 'blinks' until the player is gradually visible
        let tw = this.tweens.add({
            targets: player,
            alpha: 1,
            duration: 200,
            ease: 'Linear',
            repeat: 3,
        });
    }
    update() {
        if (this.leftKey.isDown) {
            this.player.setVelocityX(-5);
            if (this.player.isOnGround) {
                this.player.play('walk', true);
            }
        } else if (this.rightKey.isDown) {
            this.player.setVelocityX(5);
            if (this.player.isOnGround) {
                this.player.play('walk', true);
            }
        } else {
            this.player.setVelocityX(0);
            if (this.player.isOnGround) {
                this.player.play('idle', true);
            }
        }
        if ((this.jumpKey.isDown || this.upKey.isDown) && this.player.isOnGround) {
            this.player.setVelocityY(-20);
            this.player.play('jump', true);
            this.player.isOnGround = false;
        }

        if (this.player.body.velocity.x > 0) {
            this.player.setFlipX(false);
        } else if (this.player.body.velocity.x < 0) {
            this.player.setFlipX(true);
        }
    }
}