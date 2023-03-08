import { Quaternion, Time, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class CableCarMove extends ZepetoScriptBehaviour {

    public _points:Transform[] = new Array();
    private _cnt : number = 0;
    public _speed : number;
        
    Start() {    
    }
    
    Update(){
        this.Move();
    }

    private Move(){
        this.transform.position = Vector3.MoveTowards(this.transform.position, this._points[this._cnt].position, this._speed * Time.deltaTime);
        let dist = Vector3.Distance(this._points[this._cnt].position, this.transform.position);
        if (dist < 0.1){
            ++this._cnt;
        }
        
        if (this._cnt == this._points.length){
            this.Reset(this._points[0].position);
        }
    }

    private Reset(startposition : Vector3){
        this._cnt = 0;
        this.transform.position = startposition;
        this.gameObject.SetActive(false);
    }
}