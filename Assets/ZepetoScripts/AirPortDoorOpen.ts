import { Collider } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class AirPortDoorOpen extends ZepetoScriptBehaviour {

    OnTriggerEnter(coll : Collider){
        console.log("AirPortDoorOpen 111 " + this.gameObject.name);
        if(coll.transform.tag == "Player"){
            console.log("AirPortDoorOpen 222 " + this.gameObject.name);
            GameManager.instance.AirPortDoorCheck(this.gameObject);
        }
    }
}