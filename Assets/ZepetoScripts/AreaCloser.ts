import { Collider, Transform } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class AreaCloser extends ZepetoScriptBehaviour {
    private resetPoint : Transform;
    public areaNum : number;
    Start(){
        this.resetPoint = this.transform.GetChild(0).transform;
    }
    OnTriggerEnter(col : Collider){
        if(col.gameObject.tag == "Player"){ // 원래 위치로 막는 용도로 사용될 예정
            GameManager.instance.AreaClose(this.resetPoint, this.areaNum);
        }
    }

}