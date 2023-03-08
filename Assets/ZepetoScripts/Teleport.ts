import { Collider, Transform, Vector3 } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';
//import PlayerCtrl from './PlayerCtrl';

export default class Teleport extends ZepetoScriptBehaviour {
    public targetPlace : Transform;

    OnTriggerEnter(coll : Collider){
        if(coll.gameObject.tag === "Player"){
            GameManager.instance.Teleport(this.targetPlace);
            //coll.gameObject.transform.GetComponentInChildren<PlayerCtrl>().Teleport(this.targetPlace.position); //new Vector3(-29,66,-123)
        }
    }
}