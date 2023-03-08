import { Collider } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class Sit extends ZepetoScriptBehaviour {

    Start(){
        this.transform.parent.GetChild(2).gameObject.SetActive(false);
    }

    OnTriggerExit(coll:Collider){
        if(coll.transform.tag == "Player"){
            GameManager.instance.SitOut(this.transform);
        }
    }
}