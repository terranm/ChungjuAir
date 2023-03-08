import { Collider } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class NewTypescript extends ZepetoScriptBehaviour {
    public QuestNum : string;
    OnTriggerEnter(coll : Collider){
        if(coll.gameObject.tag === "Player"){
            GameManager.instance.NextQuest(this.QuestNum);
        }
    }
}