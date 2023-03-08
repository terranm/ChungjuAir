import { Compute_DistanceTransform_EventTypes } from 'TMPro';
import { Collider, GameObject, Transform, Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class ZipLineStater extends ZepetoScriptBehaviour {
    public _speed : number;
    public points : Transform[];

    Start(){
        this.points = new Array();
        this.points = this.transform.GetComponentsInChildren<Transform>();
        this.points.shift();
        this._speed = 0.015;
        GameManager.instance.ZipRideSetting(this.points, this._speed);
    }
}