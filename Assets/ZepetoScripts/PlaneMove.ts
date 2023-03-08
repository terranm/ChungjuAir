import { Collider, GameObject, Time, Transform, Vector3 } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class PlaneMove extends ZepetoScriptBehaviour {
    public targets : GameObject;
    private moveTargetList : Transform[];

    public targetNum :number;
    public speed : number;

    private speedAdd : number;
    Start(){
        this.targetNum = 0;
        this.speedAdd = 20;
        this.speed = this.speedAdd;
        this.targets = this.transform.parent.gameObject;
        this.moveTargetList = this.targets.GetComponentsInChildren<Transform>();
        let temp = this.moveTargetList.shift();
        console.log(temp.name);
        temp = this.moveTargetList.shift();
        console.log(temp.name);
    }
    Update(){
        this.gameObject.transform.position = Vector3.MoveTowards(this.gameObject.transform.position, this.moveTargetList[this.targetNum].position, this.speed * Time.deltaTime);
        let dist = (this.gameObject.transform.position - this.moveTargetList[this.targetNum].position).magnitude
        if (dist < 0.5){
            this.gameObject.transform.position = this.moveTargetList[this.targetNum].position;
            this.targetNum++;
            if (this.targetNum == this.moveTargetList.length){
                this.targetNum = 0;
                this.speed = this.speedAdd;
            }

            this.gameObject.transform.LookAt(this.moveTargetList[this.targetNum].position);
            this.gameObject.transform.Rotate(new Vector3(90,-90,-105));
            if (this.moveTargetList.length < 5) return;

            if(this.targetNum > 5){
                this.speed-=this.speedAdd;
            }
            else {
                this.speed+=this.speedAdd;
            }
        }

        // if(this.gameObject.transform.position == this.moveTargetList[this.targetNum].position){
        //     this.targetNum++;
        //     if(this.targetNum == 9) {
        //         this.targetNum = 0;
        //         this.speed = this.speedAdd;
        //     }

        //     this.gameObject.transform.LookAt(this.moveTargetList[this.targetNum].position);
        //     this.gameObject.transform.Rotate(new Vector3(90,-90,-105));
        //     if(this.targetNum > 5){
        //         this.speed-=this.speedAdd;
        //     }
        //     else {
        //         this.speed+=this.speedAdd;
        //     }
        // }
    }
}