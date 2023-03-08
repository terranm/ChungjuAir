import { Collider, GameObject } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class BtnOnOffTrigger extends ZepetoScriptBehaviour {
    public btnList : GameObject[];

    Start() {
        // console.log(this.transform.name);
        for(let i = 0; i < this.btnList.length; i++){
            this.btnList[i].SetActive(false);
        }
    }

    OnTriggerEnter(col:Collider){
        if (col.transform.tag == "Player"){ //console.log("in" + col.transform.name);
            for(let i = 0; i < this.btnList.length; i++){
                if (this.btnList[i].IsDestroyed()) this.btnList.splice(i,1);
                else this.btnList[i].SetActive(true);
                
            }
        }
    }

    OnTriggerExit(col:Collider){
        if (col.transform.tag == "Player"){
            for(let i = 0; i < this.btnList.length; i++){
                if (this.btnList[i].IsDestroyed()) this.btnList.splice(i,1);
                else this.btnList[i].SetActive(false);
            }
        }
    }
}