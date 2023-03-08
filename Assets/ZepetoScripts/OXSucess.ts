import { Collider } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class OXSucess extends ZepetoScriptBehaviour {

    OnTriggerEnter(coll : Collider){
        if(coll.gameObject.tag === "Player"){
            this.transform.parent.gameObject.SetActive(false);
            //coll.gameObject.transform.GetComponentInChildren<PlayerCtrl>().Teleport(this.targetPlace.position); //new Vector3(-29,66,-123)
        }
    }

}