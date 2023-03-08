import { Camera, Collider, GameObject, Input, LayerMask, Mathf, Physics, Quaternion, RaycastHit, Vector3, WaitForSeconds, YieldInstruction } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import GameManager from './GameManager';

export default class CameraController extends ZepetoScriptBehaviour {
    public multiplay: ZepetoWorldMultiplay;
    layerMask_Button: number = 1 << LayerMask.NameToLayer("Button");
    private camera: Camera;
    //private starter:Starter;
    private waitForChangeTargetSeconds: YieldInstruction = new WaitForSeconds(0.01);
    Start() {    
        this.multiplay = GameObject.Find("WorldMultiplay").GetComponent<ZepetoWorldMultiplay>();
        //this.starter = GameObject.FindGameObjectWithTag("Starter").GetComponent<Starter>();
        this.layerMask_Button = 1 << LayerMask.NameToLayer("Button");
        this.camera = this.transform.GetComponent<Camera>();
    }

    Update(){
        if (this.multiplay.Room != null && this.multiplay.Room.IsConnected)
        {
            const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.multiplay.Room.SessionId);
            if (hasPlayer)
            {
                this.UIRay();
                this.Culling();
            }
        }
    }

    UIRay()
    {
        // console.log(GameManager.UI.isPopupOn);
        if (Input.GetMouseButtonDown(0) && !GameManager.UI.isPopupOn)
        {
            // console.log("click");
            // var hit = $ref<RaycastHit>();
            // var ray = this.camera.ScreenPointToRay(Input.mousePosition);
            // if ((Physics.Raycast(ray.origin, ray.direction, hit, Mathf.Infinity, this.layerMask_Button)))
            let ray = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera.ScreenPointToRay(Input.mousePosition);
            let ref = $ref<RaycastHit>();    

            if(Physics.Raycast(ray, ref,Mathf.Infinity, this.layerMask_Button))
            {
                let _hit = $unref(ref);//hit.value;
                switch(_hit.collider.gameObject.name){
                    case "PassportBtn" :
                        GameManager.Resource.Destroy(_hit.collider.gameObject);
                        GameManager.instance.TakePassport();
                        GameManager.instance.TakeDisembarkationCard();
                    break;
                    case "CarrierBtn" :
                        GameManager.Resource.Destroy(_hit.collider.transform.parent.parent.gameObject);
                        GameManager.instance.TakeCarrier();
                    break;
                    case "OutCarrierBtn" :
                        GameManager.instance.OutCarrier(_hit.collider.transform.parent.GetChild(0));
                    break;
                    case "RegionalP1Btn" :
                        GameManager.UI.Popup("Popup_Script-RegionalP1");
                    break;
                    case "RegionalP2Btn" :
                        GameManager.UI.Popup("Popup_Script-RegionalP2");
                    break;
                    case "RegionalP3Btn" :
                        GameManager.UI.Popup("Popup_Script-RegionalP3");
                    break;
                    case "RegionalP4Btn" :
                        GameManager.UI.Popup("Popup_Script-RegionalP4");
                    break;
                    case "RegionalP5Btn" :
                        GameManager.UI.Popup("Popup_Script-RegionalP5");
                    break;
                    case "RegionalP6Btn" :
                        GameManager.UI.Popup("Popup_Script-RegionalP6");
                    break;
                    case "RegionalP7Btn" :
                        GameManager.UI.Popup("Popup_Script-RegionalP7");
                    break;
                    case "Porty1Btn" :
                        GameManager.Resource.Destroy(_hit.collider.gameObject);
                        GameManager.instance.NextQuest("2");
                    break;
                    case "Porty2Btn" :
                        GameManager.Resource.Destroy(_hit.collider.gameObject);
                        GameManager.instance.NextQuest("5");
                    break;
                    case "Porty3Btn" :
                        GameManager.Resource.Destroy(_hit.collider.gameObject);
                        GameManager.instance.NextQuest("7");
                        GameManager.instance.TakeGranmaBag();
                    break;
                    case "OXClearBtn" :
                        GameManager.Resource.Destroy(_hit.collider.gameObject);
                        _hit.collider.transform.parent.GetChild(0).gameObject.SetActive(false);
                        _hit.collider.transform.parent.GetChild(1).gameObject.SetActive(true);
                        GameManager.instance.GetPortyMask();
                    break;
                    case "OXExitBtn" :
                        GameManager.instance.OXEndCheck(_hit.collider.gameObject);
                    break;
                    case "GranmaBtn" :
                        GameManager.instance.GranmaCheck(_hit.collider.gameObject);
                    break;
                    case "BusCheckBtn" :
                        GameManager.instance.BusCheck(_hit.collider.gameObject);
                    break;
                    case "ZipBtn" :
                        GameManager.instance.ZipRide(_hit.collider.gameObject);
                    break;
                    case "SitBtn" :
                        GameManager.instance.SitProcess(_hit.collider.gameObject);
                    break;
                    
                }
            }
        }
    }

    Culling(){
        if (this.gameObject.transform.localPosition.z > -0.5){
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetChild(0).GetChild(0).gameObject.SetActive(false);
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetChild(0).GetChild(1).gameObject.SetActive(false);
        }else{
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetChild(0).GetChild(0).gameObject.SetActive(true);
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetChild(0).GetChild(1).gameObject.SetActive(true);
        }
    }
    
    OnTriggerEnter(col:Collider){
        if(col.gameObject.tag == "Player"){
            let layerMask = (1 << LayerMask.NameToLayer("Player"));  // Everything에서 Player 레이어만 제외하고 충돌 체크함
            layerMask  = ~layerMask ;
            ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera.cullingMask = layerMask;
        }
    }

    OnTriggerExit(col: Collider) {
        if(col.gameObject.tag == "Player"){
            let layerMask = (1 << LayerMask.NameToLayer("Everything"));  
            layerMask  = ~layerMask ;
            ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera.cullingMask = layerMask;
        }
    }
}