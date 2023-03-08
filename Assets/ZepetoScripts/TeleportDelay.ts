import { Collider, Transform, WaitForSeconds } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class LakeDelay extends ZepetoScriptBehaviour {

    public loadingImgNum : number;
    private loadingUITr : Transform;

    Start(){
        switch(this.loadingImgNum){
            case 0:
                this.loadingUITr = GameManager.UI.loadingUI
                break;
            case 1:
                this.loadingUITr = GameManager.UI.loadingUI_lake
                break;
        }
    }

    OnTriggerEnter(coll:Collider){
        if(coll.gameObject.tag === "Player"){
            this.StartCoroutine(this.Loading());
        }
    }

    *Loading(){
        this.loadingUITr.gameObject.SetActive(true);
        yield new WaitForSeconds(2);
        this.loadingUITr.gameObject.SetActive(false);
    }
}