import {MarkerOptions, DivIcon, DomUtil} from 'leaflet';
import {DynmapPlayer} from "@/dynmap";
import Util from '@/util';

const playerImage = require('@/assets/images/player_face.png');

const noSkinImage: HTMLImageElement = document.createElement('img');
noSkinImage.height = 16;
noSkinImage.width = 16;

const smallImage: HTMLImageElement = document.createElement('img');
smallImage.height = 16;
smallImage.width = 16;

const largeImage: HTMLImageElement = document.createElement('img');
largeImage.height = 32;
largeImage.width = 32;

const bodyImage: HTMLImageElement = document.createElement('img');
bodyImage.height = 32;
bodyImage.width = 32;

noSkinImage.src = smallImage.src = largeImage.src = bodyImage.src = playerImage;
noSkinImage.className = smallImage.className = largeImage.className = bodyImage.className = 'player__icon';

export interface PlayerIconOptions extends MarkerOptions {
	smallFace: boolean,
	showSkinFace: boolean,
	showBody: boolean,
	showHealth: boolean,
}

export class PlayerIcon extends DivIcon {
	private readonly _player: DynmapPlayer;
	private _container?: HTMLDivElement;
	private _playerImage?: HTMLImageElement;
	private _playerInfo?: HTMLSpanElement;
	private _playerName?: HTMLSpanElement;

	private _playerHealth?: HTMLDivElement;
	private _playerHealthBar?: HTMLDivElement;
	private _playerArmor?: HTMLDivElement;
	private _playerArmorBar?: HTMLDivElement;

	// @ts-ignore
	options: PlayerIconOptions;

	constructor(player: DynmapPlayer, options: PlayerIconOptions) {
		super(options);
		this._player = player;
	}

	createIcon(oldIcon: HTMLElement) {
		if (oldIcon) {
			DomUtil.remove(oldIcon);
		}

		const player = this._player;

		this._container = document.createElement('div');

		this._container.classList.add('marker', 'marker--player', 'leaflet-marker-icon');

		this._playerInfo = document.createElement('div');
		this._playerInfo.className = 'marker__label';

		this._playerName = document.createElement('span');
		this._playerName.className = 'player__name';
		this._playerName.innerText = player.name;

		if (this.options.showSkinFace) {
			let size;

			if (this.options.smallFace) {
				this._playerImage = smallImage.cloneNode() as HTMLImageElement;
				size = '16';
			} else if(this.options.showBody) {
				this._playerImage = bodyImage.cloneNode() as HTMLImageElement;
				size = 'body';
			} else {
				this._playerImage = largeImage.cloneNode() as HTMLImageElement;
				size = '32';
			}

			Util.getMinecraftHead(player, size).then(head => {
				this._playerImage!.src = head.src;
			});
		} else {
			this._playerImage = noSkinImage.cloneNode(false) as HTMLImageElement;
		}

		this._container.appendChild(this._playerImage);
		this._container.appendChild(this._playerInfo);
		this._playerInfo.appendChild(this._playerName);

		if (this.options.showHealth) {
			this._playerHealth = document.createElement('div');
			this._playerHealth.className = 'player__health';

			this._playerArmor = document.createElement('div');
			this._playerArmor.className = 'player__armor';

			this._playerInfo.appendChild(this._playerHealth);
			this._playerInfo.appendChild(this._playerArmor);

			this._playerHealthBar = document.createElement('div');
			this._playerHealthBar.className = 'player__health-bar';

			this._playerArmorBar = document.createElement('div');
			this._playerArmorBar.className = 'player__armor-bar';

			this._playerHealth.hidden = this._playerArmor.hidden = true;
		} else {
			this._playerName.classList.add('playerNameNoHealth');
		}

		return this._container;
	}

	update() {
		if(!this._container) {
			return;
		}

		this._playerName!.innerText = this._player!.name;

		if(this.options.showHealth) {
			if (this._player.health !== undefined && this._player.armor !== undefined) {
				this._playerHealth!.hidden = false;
				this._playerArmor!.hidden = false;
				this._playerHealthBar!.style.width = Math.ceil(this._player.health * 2.5) + 'px';
				this._playerArmorBar!.style.width = Math.ceil(this._player.armor * 2.5) + 'px';
			} else {
				this._playerHealth!.hidden = true;
				this._playerArmor!.hidden = true;
			}
		}
	}
}
