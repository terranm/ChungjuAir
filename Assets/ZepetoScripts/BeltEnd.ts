import { Collider, GameObject } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import CarrierCreater from './CarrierCreater';

export default class BeltEnd extends ZepetoScriptBehaviour {
    public carrierCreater : GameObject;
    OnTriggerEnter(col : Collider){
        if (col.gameObject.tag == "Carrier"){
            this.carrierCreater.GetComponent<CarrierCreater>().CarrierDestory(col.gameObject.name);
        }
    }
}