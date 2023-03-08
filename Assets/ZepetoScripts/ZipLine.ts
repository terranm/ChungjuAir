import { Compute_DistanceTransform_EventTypes } from 'TMPro';
import { Collider, GameObject, Quaternion, Time, Transform, Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';
//import PlayerCtrl from './PlayerCtrl';

export default class ZipLine extends ZepetoScriptBehaviour {
    //  public _points : Transform[] = new Array();
    private _cnt : number = 1;
    private speed : number = 3;

    Move(points:Transform[], speed:number){
        if (this._cnt < points.length - 1){
            this.speed += speed;
        }
        else {
            if (this.speed > 0.5){
                this.speed -= (speed * 3);
            }
        }
        this.transform.position = Vector3.MoveTowards(this.transform.position, points[this._cnt].position, this.speed * Time.deltaTime);
        //console.log("speed " + this.speed);
        let dir: Vector3 = Vector3.zero;
        dir = (points[this._cnt].position - this.transform.position).normalized;
        let dist = Vector3.Distance(points[this._cnt].position, this.transform.position)
        if (dist > 0.5) {
            this.transform.rotation = Quaternion.Slerp(this.transform.rotation, Quaternion.LookRotation(dir), Time.deltaTime * 1);
        }
        else {
            if (this._cnt +1 < points.length) {
                dir = (points[this._cnt++].position - this.transform.position).normalized;
            } else if (this._cnt + 1 > points.length){
                dir = (points[0].position - this.transform.position).normalized;
            }
        
            this.transform.rotation = Quaternion.Slerp(this.transform.rotation, Quaternion.LookRotation(dir), Time.deltaTime * 1);
        }
        
        //this.transform.LookAt(this.foodPos[this.foodNum].transform.position);

        if (this.transform.position == points[this._cnt].position){
            dir = new Vector3((points[this._cnt].position.x - this.transform.position.x), (points[this._cnt].position.y - this.transform.position.y), 0).normalized;
            //this.transform.rotation = Quaternion.LookRotation(this.dir);
            this._cnt++;
        }

        // if (this.foodNum == 11 && this.number == 0 && !this.isDown) {
        //     this.StopDown();
        // }
        return this._cnt == points.length;
        // if (this._cnt == this._points.Length) {
        //     this._cnt = 0;
        // }
    }
}