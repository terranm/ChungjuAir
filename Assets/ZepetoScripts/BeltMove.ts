import { Collider, Time, Transform, Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class BeltMove extends ZepetoScriptBehaviour {
    public endPoint : Transform;
    public speed : number;
    OnTriggerStay(col : Collider){
        //console.log("col" + col.gameObject.name);
        if (col.transform.tag == "Carrier"){
            col.transform.position = Vector3.MoveTowards(col.transform.position, this.endPoint.position, this.speed * Time.deltaTime);
        }
    }

}