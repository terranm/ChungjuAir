import { Collider, GameObject } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class PhotozoneColl extends ZepetoScriptBehaviour {
    // public screenshotModule : GameObject;
    // Start(){
    //     this.screenshotModule = GameObject.Find("ZepetoScreenShotModule");
    //     this.screenshotModule.SetActive(false);
    // }
    OnTriggerEnter(coll : Collider){
        if(coll.gameObject.tag === "Player"){
            if(!GameManager.instance.isInPhotozone){
                GameManager.instance.isInPhotozone = true;
                // this.screenshotModule.SetActive(true);
                GameManager.UI.Popup("Popup_Upper-CameraOn", GameManager.instance.GetPopupTime);

                // // 유니티 내부 테스트용 런칭시 삭제 필요
                // GameManager.instance.NextQuest("11");
                // GameManager.instance.CloseQuestPart("6");
            }
        }
    }
}