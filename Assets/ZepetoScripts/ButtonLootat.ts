import { GameObject, Quaternion, Time } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';


export default class ButtonLookat extends ZepetoScriptBehaviour {
    public multiPlay:ZepetoWorldMultiplay;
    public turnSpeen:number;

    Start() {    
        this.multiPlay = GameObject.Find("WorldMultiplay").GetComponent<ZepetoWorldMultiplay>();
        this.turnSpeen = 10;
    }

    Update(){
        if (this.multiPlay.Room != null && this.multiPlay.Room.IsConnected){
            if (ZepetoPlayers.instance.HasPlayer(this.multiPlay.Room.SessionId)){
                let dir = (ZepetoPlayers.instance.ZepetoCamera.camera.transform.position - this.transform.position).normalized;
                let lookRot = Quaternion.LookRotation(dir);
                lookRot.x = 0;
                lookRot.z = 0;
    
                this.transform.rotation = Quaternion.Slerp(this.transform.rotation, lookRot, this.turnSpeen * Time.deltaTime);
            }
        }
    }
}