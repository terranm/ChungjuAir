import {ZepetoScriptableObject, ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {ZepetoWorldMultiplay} from 'ZEPETO.World'
import {Room, RoomData} from 'ZEPETO.Multiplay'
import {Player, State, Transform, Vector3} from 'ZEPETO.Multiplay.Schema'
import {CharacterState, SpawnInfo, ZepetoCharacter, ZepetoCharacterCreator, ZepetoPlayers} from 'ZEPETO.Character.Controller'
import * as UnityEngine from "UnityEngine";
import CameraClamp from './CameraClamp'
import GameManager from './GameManager'
import { LightProbeUsage } from 'UnityEngine.Rendering'
import DataSc from './DataSc'

interface MessageModel {
    sessionId: string,
    name: string,
    state: boolean
    
 }

export default class ClientStarter extends ZepetoScriptBehaviour {

    public multiplay: ZepetoWorldMultiplay;
    public StartPosition : UnityEngine.Transform;
    
    public player:Player;

    private room: Room;
    public get Room():Room{ return this.room; }
    private currentPlayers: Map<string, Player> = new Map<string, Player>();

    public GranmaPosition : UnityEngine.Transform;
    public GranmaScriptable : ZepetoScriptableObject<DataSc>;
    
    Start() {
        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };

        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
            room.AddMessageHandler<MessageModel>("Wear",(message:MessageModel)=>{
                console.log("Wear");
                if(message.name == "PortyMask"){
                    if (message.state){
                        console.log("PortyMask on");
                        GameManager.instance.WearPortyMask(message.sessionId);
                    }
                    else{
                        console.log("PortyMask off");
                        GameManager.instance.TurnOffObj(message.name, message.sessionId);
                    }
                }
            })
        };

        this.StartCoroutine(this.SendMessageLoop(0.1));
        // let tr = new UnityEngine.Transform();
        // tr.position = new UnityEngine.Vector3(20, 10, 3);
        // tr.rotation = UnityEngine.Quaternion.Euler(new UnityEngine.Vector3(0,180,0));
        // this.NPCCreate(this.GranmaScriptable, tr);
        var spawn = new SpawnInfo();
        spawn.position = this.GranmaPosition.position;//new UnityEngine.Vector3(20, 10, 3)//transform.position;
        spawn.rotation = this.GranmaPosition.rotation;//UnityEngine.Quaternion.Euler(new UnityEngine.Vector3(0,180,0))//transform.rotation;
        ZepetoCharacterCreator.CreateByZepetoId("zepeto.dorothy", spawn, (character : ZepetoCharacter)=>{
            GameManager.instance.granma = character.transform;
            var npcAnim = character.transform.GetComponentInChildren<UnityEngine.Animator>();
            npcAnim.runtimeAnimatorController = this.GranmaScriptable["anim"] as UnityEngine.RuntimeAnimatorController;
            npcAnim.avatar = this.GranmaScriptable["avatar"] as UnityEngine.Avatar;
        });
    }

    
    private NPCCreate(scriptable:ZepetoScriptableObject<DataSc>, transform :UnityEngine.Transform){
    
    }

    // ?????? Interval Time?????? ???(local)????????? transform??? server??? ???????????????.
    private* SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);
            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    // //?????? ??????????????? ?????? ????????? ????????? ??????????????? ???????????? ????????? ??????
                    // if (myPlayer.character.CurrentState != CharacterState.Idle && !this._player.isRidingZip)
                    this.SendTransform(myPlayer.character.transform);
                    //GameManager.player = this.player;
                    // console.log("tick tr gm : " + GameManager.player.transform.position.x + 
                    // ", tr loc : " + ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.position.x +
                    // ", tr this : " + this.player.transform.position.x);
                    //     //?????? ??????????????? ?????? ???????????? ???????????? ?????? ??????????????? ???????????? ????????? ??????
                    // if(this._player != null && this._player.isRidingZip){
                    //     this.SendTransform(myPlayer.character.transform);
                    //}
                }
            }
        }
    }

    private OnStateChange(state: State, isFirst: boolean) {
        // ??? OnStateChange ????????? ?????? ???, State ?????? ???????????? ???????????????.
        if (isFirst) {
            // [CharacterController] (Local)Player ??????????????? Scene??? ????????? ??????????????? ??? ??????
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
                myPlayer.character.gameObject.tag = "Player";
                let zepetoCameraClamp = ZepetoPlayers.instance.ZepetoCamera.cameraParent.gameObject.AddComponent<CameraClamp>();
                zepetoCameraClamp.Init(-40, 70, ZepetoPlayers.instance.ZepetoCamera.Speed);
                let lightProb = myPlayer.character.GetComponentsInChildren<UnityEngine.SkinnedMeshRenderer>();
                lightProb.forEach((value, index)=>{
                    value.lightProbeUsage = LightProbeUsage.BlendProbes;
                });
                myPlayer.character.OnChangedState.AddListener((cur, next) => {
                    this.SendState(next);
                });
            });
            // [CharacterController] Player ??????????????? Scene??? ????????? ??????????????? ??? ??????
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                const isLocal = this.room.SessionId === sessionId;
                if (!isLocal) {
                    let lightProb = ZepetoPlayers.instance.GetPlayer(sessionId).character.GetComponentsInChildren<UnityEngine.SkinnedMeshRenderer>();
                    lightProb.forEach((value, index)=>{
                        value.lightProbeUsage = LightProbeUsage.BlendProbes;
                    });
                    const player: Player = this.currentPlayers.get(sessionId);
                    // [RoomState] player ??????????????? state??? ????????? ????????? ???????????????.
                    player.OnChange += (changeValues) => this.OnUpdatePlayer(sessionId, player);
                }
            });
        }

        let join = new Map<string, Player>();
        let leave = new Map<string, Player>(this.currentPlayers);

        state.players.ForEach((sessionId: string, player: Player) => {
            if (!this.currentPlayers.has(sessionId)) {
                join.set(sessionId, player);
            }
            leave.delete(sessionId);
        });

        // [RoomState] Room??? ????????? player ???????????? ??????
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));
        // [RoomState] Room?????? ????????? player ???????????? ??????
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
    }

    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);
        this.currentPlayers.set(sessionId, player);

        const spawnInfo = new SpawnInfo();
        const position = this.StartPosition.position;
        const rotation = this.StartPosition.rotation;
        spawnInfo.position = position;
        spawnInfo.rotation = rotation;

        const isLocal = this.room.SessionId === player.sessionId;
        if(isLocal) {
            this.player = player;
            GameManager.player = player;
        }
        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);    
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        this.currentPlayers.delete(sessionId);

        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }

    private OnUpdatePlayer(sessionId: string, player: Player) {

        const position = this.ParseVector3(player.transform.position);
        const rotation = this.ParseVector3(player.transform.rotation);
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);

        let dist = UnityEngine.Vector3.Distance(position, zepetoPlayer.character.transform.position);
        if(dist >= 3){
            zepetoPlayer.character.transform.position = position;
            zepetoPlayer.character.transform.rotation = UnityEngine.Quaternion.Euler(rotation);
        }else{
            zepetoPlayer.character.MoveToPosition(position);
        }
        // //???????????? ??????????????? ??????????????????
        // if(!player.isRide){
            
        //     zepetoPlayer.character.characterController.enabled = true;
        //     //ZepetoCharacter???????????? ????????????
        //     zepetoPlayer.character.enabled = true;
        //     zepetoPlayer.character.MoveToPosition(position);
        //     if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove)
        //     zepetoPlayer.character.Jump();
            
        // }
        // else{
        //     //?????? ??????????????? ?????????????????? ?????????
        //     //?????? ??????????????? ????????? ???????????? ????????????
        //     //????????? ??? ???????????????????????? ????????? ?????? ??????
        //     zepetoPlayer.character.characterController.enabled = false;
        //     //ZepetoCharacter???????????? ????????????
        //     //????????? ??? ?????? ?????? ??? ???????????? ???????????? ???????????? ????????? ????????? ??????
        //     zepetoPlayer.character.enabled = false;
            
        // }
        
        if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove)
            zepetoPlayer.character.Jump();
    }

    

    private SendTransform(transform: UnityEngine.Transform) {
        const data = new RoomData();

        const pos = new RoomData();
        pos.Add("x", transform.localPosition.x);
        pos.Add("y", transform.localPosition.y);
        pos.Add("z", transform.localPosition.z);
        data.Add("position", pos.GetObject());

        const rot = new RoomData();
        rot.Add("x", transform.localEulerAngles.x);
        rot.Add("y", transform.localEulerAngles.y);
        rot.Add("z", transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());
        this.room.Send("onChangedTransform", data.GetObject());
    }

    // private SendTransformCar(transform: UnityEngine.Transform) {
    //     const data = new RoomData();

    //     const pos = new RoomData();
    //     pos.Add("x", transform.localPosition.x);
    //     pos.Add("y", transform.localPosition.y);
    //     pos.Add("z", transform.localPosition.z);
    //     data.Add("position", pos.GetObject());

    //     const rot = new RoomData();
    //     rot.Add("x", transform.localEulerAngles.x);
    //     rot.Add("y", transform.localEulerAngles.y);
    //     rot.Add("z", transform.localEulerAngles.z);
    //     data.Add("rotation", rot.GetObject());
    //     this.room.Send("onChangedTransformCar", data.GetObject());
    // }

    private SendState(state: CharacterState) {
        const data = new RoomData();
        data.Add("state", state);
        this.room.Send("onChangedState", data.GetObject());
    }

    private ParseVector3(vector3: Vector3): UnityEngine.Vector3 {
        return new UnityEngine.Vector3
        (
            vector3.x,
            vector3.y,
            vector3.z
        );
    }
}