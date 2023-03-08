import { Collider, Transform } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class OXFailed extends ZepetoScriptBehaviour {

    public targetTr : Transform;
    public howFail : number;
    
    private trlist:Transform[];

    Start(){
        this.trlist = new Array();
        this.trlist = this.targetTr.parent.GetComponentsInChildren<Transform>(); 
    }
    OnTriggerEnter(coll : Collider){
        if(coll.gameObject.tag === "Player"){
            this.trlist.forEach((tr)=>{
                console.log(this.trlist.length + " " +tr.name);
                tr.gameObject.SetActive(true);
            });
            switch(this.howFail) {
                case 0 :
                    GameManager.UI.Popup("Popup_Upper-OXFail", GameManager.instance.GetPopupTime);
                    break;
                case 1 :
                    GameManager.UI.Popup("Popup_Upper-OXFallen", GameManager.instance.GetPopupTime);
                    break;
            }
            //coll.gameObject.transform.GetComponentInChildren<PlayerCtrl>().Teleport(this.targetPlace.position); //new Vector3(-29,66,-123)
        }
    }

}