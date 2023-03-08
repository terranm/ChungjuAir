import { ZepetoScriptableObject, ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {ZepetoWorldMultiplay} from 'ZEPETO.World'
import {Room, RoomData} from 'ZEPETO.Multiplay'
import { Player} from 'ZEPETO.Multiplay.Schema';
import { SpawnInfo, UIZepetoPlayerControl, ZepetoCharacter, ZepetoCharacterCreator, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Animator, Avatar, BoxCollider, GameObject, Quaternion, RuntimeAnimatorController, Time, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import ResourcesManager from './ResourcesManager';
import UIManagers from './UIManagers';
import ZipLine from './ZipLine';
import DataSc from './DataSc';
import PhotozoneColl from './PhotozoneColl';

export default class GameManager extends ZepetoScriptBehaviour {

    //// 인스턴스 및 기본 변수
    private static Instance:GameManager;
    public static get instance():GameManager{return this.Instance;}
    
    __resource:ResourcesManager = new ResourcesManager();
    public static get Resource():ResourcesManager {return this.Instance.__resource;}

    __ui:UIManagers = new UIManagers();
    public static get UI():UIManagers{ return this.Instance.__ui;}

    public room: Room;
    public static get Room():Room{return this.Instance.room;}
    
    private _popupTime:number = 2;
    public get GetPopupTime():number{return this._popupTime;}
    
    public static player:Player;
    public multiplay: ZepetoWorldMultiplay;
    ////
    
    public portyMaskMap:Map<string, GameObject> = new Map<string, GameObject>(); // 아이템 착용자 리스트
    public portyMaskOrignMap:Map<string, GameObject> = new Map<string, GameObject>(); // 원래 착용한 아이템 저장

    public isInPhotozone:boolean = false;
    public photozone:boolean;
    public onTarget:boolean;

    public isPeedUploadComplete : boolean;
    //// 초기 세팅
    Awake() {    
        GameManager.Instance = this;
        this.multiplay = GameObject.Find("WorldMultiplay").GetComponent<ZepetoWorldMultiplay>();
        
        GameManager.UI.Init();
        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
            this.room.AddMessageHandler("QuestDelay",(message: string)=>{
                // print server message
                let _message = message.toString();
                this.StartCoroutine(this.QuestDelayPopup(_message));
            });
        };
    }

    *QuestDelayPopup(message : string, time : number = 1){
        yield new WaitForSeconds(time);
        GameManager.UI.Popup("Popup_Quest-" + message);
    }

    Start(){
        GameManager.UI.loadingUI.gameObject.SetActive(true);
        this.StartCoroutine(this.StartLoading(GameManager.UI.loadingUI));
    }
    
    *StartLoading(loadingUI:Transform){
        let isLoadEnd = false;
        ZepetoPlayers.instance.controllerData.inputAsset.Disable();
        while (!isLoadEnd){
            yield new WaitForSeconds(3);
            if (this.room != null && this.room.IsConnected){
                if (ZepetoPlayers.instance.HasPlayer(this.room.SessionId)){
                    isLoadEnd = true;
                    loadingUI.gameObject.SetActive(false);    
                    GameManager.instance.NextQuest("1");
                    ZepetoPlayers.instance.controllerData.inputAsset.Enable();
                    this.StopCoroutine(this.StartLoading(GameManager.UI.loadingUI));
                }
            }
        }
    }

    // Update(){
    //     console.log("QuestNum : " + GameManager.player.quest + ", positionCheck GM : " + GameManager.player.transform.position.x + ", loc : " + ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.position.x);
    // }
    ////

    //// 보조 함수
    public CourutineStarter(fun : Generator){
        this.StartCoroutine(fun);
    }
    public CourutineStopper(fun : Generator){
        this.StartCoroutine(fun);
    }
    ////


    //// 입국 심사대
    private passportMap:Map<string, GameObject> = new Map<string, GameObject>();
    private disembarkationCardMap:Map<string, GameObject> = new Map<string, GameObject>();

    private isPassEntry:boolean = false;
    private isTakePassport:boolean = false;
    private isTakeDisembarkationCard:boolean = false;

    public TakePassport(){
        if (this.isTakePassport) return;
        this.HoldSomething("Passport", new Vector3(0.12, 0.04, -0.1), new Vector3(0,0,0), 2);
        this.isTakePassport = true;
        this.StartCoroutine(this.TakePassCheck());
        GameManager.UI.Popup("Popup_Upper-TakePassport", this._popupTime);
    }

    public TakeDisembarkationCard(){
        if (this.isTakeDisembarkationCard) return;
        this.HoldSomething("DisembarkationCard", new Vector3(0.074, 0.04, -0.01), new Vector3(0,0,0), 2);
        this.isTakeDisembarkationCard = true;
        this.StartCoroutine(this.TakePassCheck());
        // GameManager.UI.Popup("Popup_Upper-TakeDisembarkationCard", this._popupTime);
    }

    private *TakePassCheck(){
        if(this.isTakePassport && this.isTakeDisembarkationCard){
            yield new WaitForSeconds(this._popupTime);
            GameManager.UI.Popup("Popup_Upper-OnPassportEntry", this._popupTime);
        }
    }

    ////

    //// 캐리어 찾기
    private isCarrierEntry:boolean = false;
    private isTakeCarrier:boolean = false;

    public TakeCarrier(){
        if (this.isTakeCarrier) return;
        this.HoldSomething("MyCarrier", new Vector3(0.13,0.05,-0.4), new Vector3(-70,0,180), 1);
        GameManager.UI.Popup("Popup_Upper-TakeCarrier", this._popupTime);
        this.isTakeCarrier = true;
    }

    public OutCarrier(passPoint : Transform){
        if (!this.isCarrierEntry){
            if (this.isTakeCarrier){
                this.NextQuest("4");
                this.CloseQuestPart("2");
                this.DestroyHandObj();
                GameManager.Resource.Destroy(passPoint.parent.GetChild(1).gameObject);
                //this.Teleport(passPoint);
            }
            else {
                GameManager.UI.Popup("Popup_Upper-OffCarrierEntry", this.GetPopupTime);
            }
        }
    }
    ////

    //// OX퀴즈
    //포티탈 획득
    public GetPortyMask(){
        //if (!GameManager.player.isPortyMask){
            this.room.Send("PortyMask", true);
            GameManager.UI.Popup("Popup_Get-Treasure");
            GameManager.UI.canvasObj.transform.GetChild(0).GetChild(2).gameObject.SetActive(true);
            this.WearPortyMask(this.room.SessionId);
            this.isOXEnd = true;
        //}
    }

    private isOXEnd:boolean = false;

    public OXEndCheck(btnObj : GameObject){
        console.log(this.isOXEnd);
        if (this.isOXEnd){
            this.NextQuest("6");
            this.Teleport(btnObj.transform.parent.GetChild(0));
            this.CloseQuestPart("4");
            GameManager.Resource.Destroy(btnObj);
        }
        else{
            GameManager.UI.Popup("Popup_Upper-TreasureCheck", this._popupTime);
        }
    }
    ////

    //// 할머니 봇짐
    private isGetGranmasBusTicket : boolean = false;
    private isTakeGranmaBag : boolean = false;
    public granma : Transform;

    public TakeGranmaBag(){
        if (this.isTakeGranmaBag) return;
        this.HoldSomething("GranmaBag", new Vector3(0.062, -0.01, 0.1), new Vector3(0,90,-90), 2);
        this.isTakeGranmaBag = true;
    }

    public GranmaCheck(btnObj:GameObject){
        if(!this.isGetGranmasBusTicket){
            if(this.isTakeGranmaBag){
                this.GranmaHandOver();
                this.isGetGranmasBusTicket = true;
                GameManager.Resource.Destroy(btnObj);
                GameManager.UI.Popup("Popup_Get-GranmaTicket");
            }
            else{
                GameManager.UI.Popup("Popup_Upper-GranmaUpper", this._popupTime);
            }
        }
    }

    public AirPortDoorCheck(door : GameObject){
        if (this.isGetGranmasBusTicket){
            door.SetActive(false);
        }
    }

    private GranmaHandOver(){
        let handTs = this.granma.GetChild(0).GetChild(1).GetChild(2)
        .GetChild(0).GetChild(1).GetChild(2).GetChild(1)
        .GetChild(1).GetChild(0).GetChild(1).GetChild(0);
        let lochandObj = GameManager.Resource.Instantiate("GranmaBag", handTs);
        lochandObj.transform.localPosition = new Vector3(-0.116370723,0.0922279954,0.00241758651);
        lochandObj.transform.localRotation = Quaternion.Euler(new Vector3(343.373993,65.5889511,188.081711));
        this.DestroyHandObj();
    }

    public BusCheck(btnObj : GameObject){
        if (this.isGetGranmasBusTicket){
            GameManager.Resource.Destroy(btnObj.transform.parent.GetChild(0).gameObject);
            GameManager.Resource.Destroy(btnObj);
            GameManager.UI.Popup("Popup_Upper-TicketPass", this._popupTime);
        }
        else{
            GameManager.UI.Popup("Popup_Upper-TicketCheck", this._popupTime);
        }
    }
    ////

    //// 집라인 타기
    private isZipStart:boolean;
    private zipPoints : Transform[];
    private zipSpeed : number;

    public ZipRideSetting(points:Transform[], speed:number){
        this.zipPoints = new Array();
        this.zipPoints = points;
        this.zipSpeed = speed;
    }

    public ZipRide(obj:GameObject){
        if (this.isZipStart) return;
        obj.SetActive(false);
        let zipLine = GameManager.Resource.Instantiate("ZipLine");
        zipLine.transform.position = this.zipPoints[0].position;
        zipLine.transform.LookAt(this.zipPoints[1].position);
        ZepetoPlayers.instance.LocalPlayer.StopMoving();
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.enabled = false;
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.SetParent(zipLine.transform);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localPosition = new Vector3(0.005,-1.329,0.036);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localRotation = Quaternion.Euler(new Vector3(0, 11.944, 0));
        this.isZipStart = true;
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isZipRide", true);
        this.StartCoroutine(this.ZipLine_Move(zipLine, this.zipPoints, this.zipSpeed));
    }

    *ZipLine_Move(zipLine : GameObject, points : Transform[], speed:number){
        while(this.isZipStart){
            yield null;
            this.isZipStart = !zipLine.GetComponent<ZipLine>().Move(points, speed);
        }
        GameManager.Resource.Destroy(zipLine);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.enabled = true;
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.SetParent(null);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isZipRide", false);
        this.StopCoroutine(this.ZipLine_Move(zipLine, points, speed));
    }
    ////

    public SitProcess(obj:GameObject){
        let benchObj = obj.transform.parent;
        benchObj.GetComponent<BoxCollider>().enabled = false;
        benchObj.GetChild(1).gameObject.SetActive(false);
        benchObj.GetChild(2).gameObject.SetActive(true);
        let sitPosition = benchObj.GetChild(0);
        this.Teleport(sitPosition);
        this.StartCoroutine(this.SitMotionCheck(obj));
    }

    private *SitMotionCheck(obj:GameObject){
        while(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.GetBool("isSit")){
            yield null;
        }
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isSit", true);
    }

    public SitOut(tr : Transform){
        let benchObj = tr.parent;
        benchObj.GetComponent<BoxCollider>().enabled = true;
        benchObj.GetChild(1).gameObject.SetActive(true);
        benchObj.GetChild(2).gameObject.SetActive(false);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isSit", false);
    }

    // public *PeedUploadComplete(){
    //     //let camera = this.transform.GetChild(5).GetChild(1).GetComponent<PhotozoneColl>().screenshotModule.activeSelf;
    //     if(this.isPeedUploadComplete){
    //         this.NextQuest("11");
    //     }
    // }

    //// 게임 가동 기타 로직
    public CloseQuestPart(questNum : string){
        this.transform.GetChild(parseInt(questNum) - 1).gameObject.SetActive(false);
    }

    /// 입국심사대 지역 차단
    public AreaClose(resetPoint : Transform, areaNum:number){
        let isEntry:boolean;
        let isTake:boolean;
        let onPopUp:string;
        let offPopUp:string;
        switch (areaNum){
            case 0 :
                isEntry = this.isPassEntry;
                isTake = this.isTakePassport && this.isTakeDisembarkationCard;
                onPopUp = "3";
                offPopUp = "Popup_Upper-OffPassportEntry";
            break;
            case 4 :
                isEntry = (GameManager.player.quest == 6);
                isTake = (GameManager.player.quest == 6);
                onPopUp = "";
                offPopUp = "Popup_Upper-OffOxClear";
            break;
        }
        if (!isEntry){
            if (isTake){
                this.NextQuest(onPopUp);
                this.EntryCheck(areaNum, resetPoint);
                this.DestroyHandObj();
            }
            else {
                this.Teleport(resetPoint);
                GameManager.UI.Popup(offPopUp, this.GetPopupTime);
            }
        }
    }
    
    private EntryCheck(areaNum:number, tr : Transform = null){
        switch(areaNum){
            case 0 :
                this.isPassEntry = true;    
                GameManager.instance.CloseQuestPart("1");
            break;
            case 4 :
                // this.isCarrierEntry = true;
                // ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.StopMoving();
            break;
        }
    }

    public Teleport(transform : Transform){ // 텔레포트 이상할때 사용함.. 고쳐야 할 필요 있음
        ZepetoPlayers.instance.controllerData.inputAsset.Disable();
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.StopMoving();
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(transform.position, transform.rotation);
        ZepetoPlayers.instance.controllerData.inputAsset.Enable();
    }

    // public Teleport(transform : Transform){ // 텔레포트 이상할때 사용함.. 고쳐야 할 필요 있음
    //     ZepetoPlayers.instance.controllerData.inputAsset.Disable();
    //     ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.StopMoving();
    //     this.StartCoroutine(this.TeleportDelay(transform));
    // }
    // private *TeleportDelay(transform: Transform){
    //     let isTeleporting = true;
    //     while(isTeleporting){
    //         yield null;
    //         ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.StopMoving();
    //         ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(transform.position, transform.rotation);
    //         yield new WaitForSeconds(0.1);
    //         let dist = Vector3.Distance(transform.position, ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.position);
    //         if(dist < 0.5){
    //             isTeleporting = false;
    //         }
    //     }
    //     ZepetoPlayers.instance.controllerData.inputAsset.Enable();
    //     this.StopCoroutine(this.TeleportDelay(transform));
    // }

    /// 아이템 부착 및 애니메이션 변경
    private handObj:GameObject[] = new Array<GameObject>();

    private HoldSomething(obj:string, position:Vector3, rotation:Vector3, itemNum:number = 0){
        let handTs = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetChild(0).
        GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(3).GetChild(1).GetChild(1)
        .GetChild(0).GetChild(1).GetChild(0);
        if (itemNum == 1) { // 캐리어 종속 위치 변경
            handTs = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetChild(0);
        }
        let lochandObj = GameManager.Resource.Instantiate(obj, handTs);
        lochandObj.transform.localPosition = position;
        lochandObj.transform.localRotation = Quaternion.Euler(rotation);
        this.handObj.push(lochandObj);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetInteger("HoldSometing", itemNum);
    }

    /// 모든 아이템 탈착 및 애니메이션 초기화
    private DestroyHandObj(){
        this.handObj.forEach((obj)=>{
            GameManager.Resource.Destroy(obj);
        })
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetInteger("HoldSometing", 0);
        //GameManager.Resource.Destroy(this.handObj);
    }

    /// 퀘스트 진행
    public NextQuest(questNum : string){
        if (questNum == "") return;
        if (GameManager.player.quest >= parseInt(questNum)) return;
        GameManager.Room.Send("QuestUpdate", parseInt(questNum));
        GameManager.UI.Popup("Popup_Quest-" + questNum);
    }

    public WearPortyMask(sessionId:string){
        let mask = this.portyMaskMap.get(sessionId);
        let maskOri  = this.portyMaskOrignMap.get(sessionId);
        
        if(mask != null){ // 마스크를 획득 한경우
            if(mask.activeSelf == true){ // 이미 착용한 경우
                return;
            }
            else{
                mask.SetActive(true);
                if(this.room.SessionId == sessionId){
                    this.room.Send("PortyMask", true);
                }
                if(maskOri != null)
                    maskOri.SetActive(false);
                return;
            }
        }
        
        // 마스크 획득, 기존에 장착한 안경, 선글라스 벗기기
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        
        let maskTr:Transform;
        let _maskTr = zepetoPlayer.character.transform.GetChild(0).
        GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(1).GetChild(0).GetComponentsInChildren<Transform>();

        // for(let i = 0; i < _maskTr.length; i++){
        //     if(_maskTr[i].transform.gameObject.name.startsWith("GLASSES") || _maskTr[i].transform.gameObject.name.startsWith("SUNGLASSES")){
        //         maskTr = _maskTr[i].transform;
        //         this.portyMaskOrignMap.set(sessionId, _maskTr[i].transform.gameObject);
        //         _maskTr[i].transform.gameObject.SetActive(false);
        //     }
        //     else{
        maskTr  = zepetoPlayer.character.transform.GetChild(0).
        GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(1).GetChild(0);
        //     }
        // }

        let __mask = GameManager.Resource.Instantiate("PortyMask", maskTr);
        __mask.transform.localPosition = __mask.transform.localPosition + new Vector3(0, 0.1, 0.05);
        this.portyMaskMap.set(sessionId, __mask);
        
        if(this.room.SessionId == sessionId){
            this.room.Send("PortyMask", true);
        }
        
    }
    ////

    public TurnOffObj(name:string, sessionId:string){
        if(name == "PortyMask"){
            let mask  = this.portyMaskOrignMap.get(sessionId);
            let curMask = this.portyMaskMap.get(sessionId);
            if(mask != null){
                mask.gameObject.SetActive(true);
            }
            curMask.SetActive(false);
            if(sessionId == this.room.SessionId)
                this.room.Send("PortyMask", false);
        }
    }

    public LeavePlayer(sessionId:string){
        this.portyMaskMap.delete(sessionId);
        this.portyMaskOrignMap.delete(sessionId);
    }

    public SendRoomMessage<T>(type:string, message:T){
        GameManager.Room.Send(type, message);
    }
    ////
}