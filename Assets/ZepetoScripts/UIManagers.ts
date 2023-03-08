import { Coroutine, GameObject, Resources, Sprite, Transform, WaitForSeconds } from 'UnityEngine';
import { Button, Image } from 'UnityEngine.UI';
import { Room } from 'ZEPETO.Multiplay';
import GameManager from './GameManager';

export default class UIManagers {

    // private sprites: Map<string, Sprite> = new Map<string, Sprite>();
    // private spritesBtn: Map<string, Sprite> = new Map<string, Sprite>();
    private popup:Map<string, GameObject> = new Map<string, GameObject>();
    //private room:Room;
    //private gameManager:GameManager;

    private boolObj:GameObject = null;
    
    public canvasObj:GameObject;

    public loadingUI:Transform;
    public loadingUI_lake:Transform;

    public isPopupOn : boolean = false;
    
    //// 레퍼런스 - 출시전 삭제 필요
    public questUICloseBtn:Button;
    public colseBtn:Button;
    private itemColseBtn:Button;
    private questBtn:Button;
    private glassesBtn:Button;
    private glassesOffBtn:Button;
    private balloonBtn:Button;
    private balloonOffBtn:Button;
    private wingBtn:Button;
    private wingOffBtn:Button;
    public carOffBtn:Button;
    private cancleBtn:Button;
    private okBtn:Button;
    ////

    public Init() {
        //this.gameManager = GameManager.instance;
        this.canvasObj = GameObject.Find("Canvas_UI").gameObject;
                
        let upper = this.canvasObj.transform.GetChild(1).GetComponentsInChildren<Transform>();
        let quest = this.canvasObj.transform.GetChild(2).GetComponentsInChildren<Transform>();
        let script  = this.canvasObj.transform.GetChild(3).GetComponentsInChildren<Transform>();
        let Get  = this.canvasObj.transform.GetChild(4).GetComponentsInChildren<Transform>();
        
        let mainUI = this.canvasObj.transform.GetChild(0);

        this.PopupInit(upper, 1);
        this.PopupInit(quest);
        this.PopupInit(script);
        this.PopupInit(Get, 3);

        let GranbtnList = this.popup.get("Popup_Get-GranmaTicket").GetComponentsInChildren<Button>()
        GranbtnList.forEach((btn)=>{
            btn.onClick.AddListener(()=>{
                this.Popup("Popup_Get-BusTicket");
            }); 
        }); 
        let BusbtnList = this.popup.get("Popup_Get-BusTicket").GetComponentsInChildren<Button>()
        BusbtnList.forEach((btn)=>{
            btn.onClick.AddListener(()=>{
                mainUI.GetChild(3).gameObject.SetActive(false);
                mainUI.GetChild(4).gameObject.SetActive(true);
                GameManager.instance.NextQuest("8");

            }); 
        }); 
        
        this.popup.get("Popup_Quest-9").GetComponentInChildren<Button>().onClick.AddListener(()=>{
            GameManager.instance.CloseQuestPart("5");
        });
        

        mainUI.GetChild(0).GetComponent<Button>().onClick.AddListener(()=>{ // 퀘스트 버튼
            this.Popup("Popup_Quest-" + GameManager.player.quest);
        });
        mainUI.GetChild(1).GetComponent<Button>().onClick.AddListener(()=>{ // 포티 탈 켜기
            mainUI.GetChild(1).gameObject.SetActive(false);
            mainUI.GetChild(2).gameObject.SetActive(true);
            GameManager.instance.WearPortyMask(GameManager.Room.SessionId);
        });
        mainUI.GetChild(2).GetComponent<Button>().onClick.AddListener(()=>{ // 포티 탈 끄기
            mainUI.GetChild(2).gameObject.SetActive(false);
            mainUI.GetChild(1).gameObject.SetActive(true);
            GameManager.instance.TurnOffObj("PortyMask", GameManager.Room.SessionId);
        });
        mainUI.GetChild(1).gameObject.SetActive(false);
        mainUI.GetChild(2).gameObject.SetActive(false);

        this.loadingUI = this.canvasObj.transform.GetChild(5);
        this.loadingUI_lake = this.canvasObj.transform.GetChild(6);
        
        // this.glassesBtn.onClick.AddListener(()=>{
        //     this.Glasses();
        // });
        // this.glassesOffBtn.onClick.AddListener(()=>{
        //     this.Glasses();
        // });
        // this.balloonBtn.onClick.AddListener(()=>{
        //     this.Balloon();
        // });
        // this.balloonOffBtn.onClick.AddListener(()=>{
        //     this.Balloon();
        // });
        // this.wingBtn.onClick.AddListener(()=>{
        //     this.Wing();
        // });
        // this.wingOffBtn.onClick.AddListener(()=>{
        //     this.Wing();
        // });
        // this.carOffBtn.onClick.AddListener(()=>{
        //     this.carPopop.gameObject.SetActive(true);
        // });
        // this.cancleBtn.onClick.AddListener(()=>{
        //     this.carPopop.gameObject.SetActive(false);
        // });
        // this.okBtn.onClick.AddListener(()=>{
        //     this.carPopop.gameObject.SetActive(false);
        //     this.carOffBtn.gameObject.SetActive(false);
        //     GameManager.GetInstance.OffCar();
        // });

        // this.glassesOffBtn.gameObject.SetActive(false);
        // this.balloonOffBtn.gameObject.SetActive(false);
        // this.wingOffBtn.gameObject.SetActive(false);
        // this.carOffBtn.gameObject.SetActive(false);
        // this.carPopop.gameObject.SetActive(false);
    }

    // public RoomInit(room:Room){
    //     this.room = room;    
    // }

    private PopupInit(obj : Transform[], btnTrNum : number = 2){ // 기본 팝업창 세팅
        let objOri = obj.shift();
        for(let i = 0; i < obj.length; i++){ 
            // if(isUpper){
            //     this.popup.set(objOri.name + "-" + obj[i].name, obj[i].gameObject);
            //     obj[i].gameObject.SetActive(false);
            // }
            // else {
                if(i % btnTrNum == 0){
                    this.popup.set(objOri.name + "-" + obj[i].name, obj[i].gameObject);
                    obj[i].gameObject.SetActive(false);
                }
                else{
                    let btn = obj[i].transform.GetComponent<Button>();
                    btn.onClick.AddListener(()=>{
                        this.ClosePopui(obj[i].parent);
                        this.isPopupOn = false;
                    });
                }
            // }
        }
        //obj[1].gameObject.SetActive(true);
        objOri.gameObject.SetActive(false);
    }

    
    public Popup(name : string, popupOffTime : number = 0){ 
        console.log("call " + name);
        let trans:Transform;
        if(this.popup.get(name) != null){
            let pop = this.popup.get(name);
            pop.transform.parent.gameObject.SetActive(true);
            pop.SetActive(true);
            trans = pop.transform;
            console.log("call 2 "+ trans.parent.name);
        }
        if (popupOffTime != 0){
            GameManager.instance.CourutineStarter(this.PopupOff(trans, popupOffTime));
        }
        else{
            this.isPopupOn = true;
        }
    }

    private *PopupOff(trans:Transform,popupOffTime:number){
        yield new WaitForSeconds(popupOffTime);
        this.ClosePopui(trans);
    }

    private ClosePopui(tr:Transform){//, popupClose : boolean = false){ // 캔버스 내의 해당 묶음용 게임 오브젝트를 끔
        //if(popupClose) 
        tr.transform.gameObject.SetActive(false); 
        tr.transform.parent.gameObject.SetActive(false); 
    }
    
    // public MoveNextPopup(name:string, level:number = null, delay:number = null){ // 퀘스트 진행 관련인 것으로 보임
    //     if(this.boolObj == null || this.boolObj == undefined){
    //         this.boolObj = this.popup.get(name);
    //     }
    //     else{
    //         this.boolObj.SetActive(false);
    //         this.boolObj = this.popup.get(name);
    //     }
    //     this.boolObj.SetActive(true);
    //     if(level != null && name != "x"){
    //         GameManager.Room.Send("QuestUpdate", parseInt(name));
    //     }
    // }

    public GetItem(name:string){

        if(name == "glasses"){
            this.glassesOffBtn.gameObject.SetActive(true);
        }
        else if(name == "balloon"){
            this.balloonOffBtn.gameObject.SetActive(true);
        }
        else{
            this.wingOffBtn.gameObject.SetActive(true);
        }
    }

    // Glasses(){
    //     if(GameManager.player.quest >= 6){  
    //         let glasses = GameManager.GetInstance.glassesMap.get(this.room.SessionId);
            
    //         if(glasses == null || glasses.gameObject.activeSelf == false)
    //         {
    //             this.gameManager.WearGlasses(this.room.SessionId);
    //             this.glassesBtn.gameObject.SetActive(false);
    //             this.glassesOffBtn.gameObject.SetActive(true);
    //         }  
    //         else{
    //             this.gameManager.TurnOffObj("glasses", this.room.SessionId);
    //             this.glassesBtn.gameObject.SetActive(true);
    //             this.glassesOffBtn.gameObject.SetActive(false);
    //         }
    //     }
    //    else{
    //         //GameManager.UI().ShowUI("x", 1);
    //         this.ShowUI("x", 1);
    //    }
    // }

    // Balloon(){
    //     if(GameManager.player.quest >= 12){
    //         let balloon = GameManager.GetInstance.ballonMap.get(this.room.SessionId);
            
    //         if(balloon == null ||balloon.activeSelf == false)
    //         {
    //             this.gameManager.WearBalloon(this.room.SessionId);
    //             this.balloonBtn.gameObject.SetActive(false);
    //             this.balloonOffBtn.gameObject.SetActive(true);
    //         }
    //         else{
    //             this.gameManager.TurnOffObj("balloon", this.room.SessionId);
    //             this.balloonBtn.gameObject.SetActive(true);
    //             this.balloonOffBtn.gameObject.SetActive(false);
    //         }
    //    }
    //    else{
    //         //GameManager.UI().ShowUI("x", 1);
    //         this.ShowUI("x",1);
    //     }
    // }

    // Wing(){
    //     if(GameManager.player.quest >= 18){
    //         let wing = GameManager.GetInstance.wingMap.get(this.room.SessionId);
            
    //         if(wing == null || wing.activeSelf == false)
    //         {
    //             this.gameManager.WearWing(this.room.SessionId);
    //             this.wingBtn.gameObject.SetActive(false);
    //             this.wingOffBtn.gameObject.SetActive(true);
    //         }
    //         else{
    //             this.gameManager.TurnOffObj("wing",this.room.SessionId);
    //             this.wingBtn.gameObject.SetActive(true);
    //             this.wingOffBtn.gameObject.SetActive(false);
    //         }
    // }
    // else{
    //         //GameManager.UI().ShowUI("x", 1);
    //         this.ShowUI("x",1);
    // }
    // }

    // *Delay(num:string){
    //     yield new WaitForSeconds(1);
    //     console.log("startcour");
    //     this.MoveNextPopup(num, 1);
    // }


}