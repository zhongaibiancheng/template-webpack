import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    init() {
        this.fullWidth = 300;
        this.health_value = 1;
    }
    _create_bomb(map) {
        const getRandomInt = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        const x = getRandomInt(30, map.widthInPixels)
        const y = getRandomInt(20, 50)
        const circ = this.matter.add.image(x, y, 'red_ball');
        circ.setScale(0.1);
        //  Change the body to a Circle with a radius of 48px
        circ.setBody({
            type: 'circle',
            radius: 15
        });

        //  Just make the body move around and bounce
        circ.setVelocity(6, 3);
        circ.setAngularVelocity(0.5);
        circ.setBounce(0.1);
        circ.setFriction(0, 0, 0);

        circ.setDepth(100);
    }
    _create_health_bar() {
        const y = 24
        const x = 60

        // background shadow
        const leftShadowCap = this.add.image(x, y, 'left-cap-shadow')
            .setOrigin(0, 0.5)

        const middleShaddowCap = this.add.image(leftShadowCap.x + leftShadowCap.width, y, 'middle-shadow')
            .setOrigin(0, 0.5)
        middleShaddowCap.displayWidth = this.fullWidth

        this.add.image(middleShaddowCap.x + middleShaddowCap.displayWidth, y, 'right-cap-shadow')
            .setOrigin(0, 0.5)

        // health bar
        this.leftCap = this.add.image(x, y, 'left-cap')
            .setOrigin(0, 0.5)

        this.middle = this.add.image(this.leftCap.x + this.leftCap.width, y, 'middle')
            .setOrigin(0, 0.5)

        this.rightCap = this.add.image(this.middle.x + this.middle.displayWidth, y, 'right-cap')
            .setOrigin(0, 0.5)

        this.setMeterPercentageAnimated(this.health_value);
    }
    setMeterPercentageAnimated(percent = 1, duration = 1000) {
        const width = this.fullWidth * percent

        this.tweens.add({
            targets: this.middle,
            displayWidth: width,
            duration,
            ease: Phaser.Math.Easing.Sine.Out,
            onUpdate: () => {
                this.rightCap.x = this.middle.x + this.middle.displayWidth

                this.leftCap.visible = this.middle.displayWidth > 0
                this.middle.visible = this.middle.displayWidth > 0
                this.rightCap.visible = this.middle.displayWidth > 0
            }
        })
    }
    _addKeys() {
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    create() {
        this.init();

        this._addKeys();

        this.walk1 = this.sound.add("walk1");
        this.walk2 = this.sound.add("walk2");
        this.star = this.sound.add("star");

        this.sound.pauseOnBlur = true;

        const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
        backgroundImage.setScale(2, 0.8);

        const coinText = this.add.text(10, 24, '金币:0', { fontFamily: 'Arial', fontSize: 14, color: '#00ff00' }).setOrigin(0, 0.5);

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
        // const objectsLayer = map.getObjectLayer('Spikes');
        // if (objectsLayer) {
        //     objectsLayer.objects.forEach(object => {
        //         const { x, y, width, height } = object;

        //         // 创建一个 Matter.js 物体
        //         const matterObject = this.matter.add.rectangle(x + width / 2, y - height / 2, width, height, { isStatic: true });
        //         matterObject.label = "spike";

        //         // 创建一个对应的游戏对象（sprite 或 image）并添加到 Group 中
        //         const gameObject = this.add.image(x + width / 2, y - height / 2, 'spike');
        //         objectsGroup.add(gameObject);
        //         gameObject.setData('matterBody', matterObject); // 将 Matter.js 物体关联到游戏对象
        //     });
        // } else {
        //     console.error('ObjectsLayer not found in tilemap');
        // }

        const objectsLayer = map.getObjectLayer('Triggers');
        if (objectsLayer) {
            objectsLayer.objects.forEach(object => {
                const { x, y, width, height } = object;

                // 创建一个 Matter.js 物体
                const matterObject = this.matter.add.rectangle(x + width / 2, y+height/2.0, width, height, { isStatic: true });
                matterObject.label = "trigger";
            });
        } else {
            console.error('ObjectsLayer not found in tilemap');
        }
        let coin_count = 0;
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
                            // this.playerHit(this.player, target);
                            this.scene.start("GameOver");

                        } else if (target === 'trigger') {
                            console.log("skip into trigger zone")
                            this.scene.start("Quiz");

                        } else if (target === 'coin') {
                            const tileWrapper = target_body.gameObject;
                            const tile = tileWrapper.tile;

                            // Only destroy a tile once
                            if (tile.properties.isBeingDestroyed) {
                                continue;
                            }
                            tile.properties.isBeingDestroyed = true;

                            this.star.play();
                            // Since we are using ES5 here, the local tile variable isn't scoped to this block -
                            // bind to the rescue.
                            this.tweens.add({
                                targets: tile,
                                alpha: { value: 0, duration: 100, ease: 'Power1' },
                                onComplete: this.destroyTile.bind(this, tile)
                            });
                            coin_count++;

                            coinText.setText("金币:" + coin_count);
                        }
                    }
                }
            }
        });
        this._create_health_bar();

        // this.create_bomb_id = setInterval(() => {
        this._create_bomb(map);
        // }, 2000);

        this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels); // 设置边界宽度为1600，高度为600
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels); // 设置相机边界与物理世界边界一致
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setZoom(0.6);

    }
    destroyTile(tile) {
        const layer = tile.tilemapLayer;
        layer.removeTileAt(tile.x, tile.y);
        tile.physics.matterBody.destroy();
    }

    playerHit(player, spike) {
        this.health_value -= 0.1;
        if (this.health_value < 0) {
            this.health_value = 0;
        }
        this.setMeterPercentageAnimated(this.health_value);
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
                this.walk1.play();
            }
        } else if (this.rightKey.isDown) {
            this.player.setVelocityX(5);
            if (this.player.isOnGround) {
                this.player.play('walk', true);
                this.walk1.play();
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